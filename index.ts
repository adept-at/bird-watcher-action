import * as core from '@actions/core';
import { Octokit } from '@octokit/rest';

interface WorkflowRunInfo {
  name: string;
  status: string | null;
  conclusion: string | null;
  lastRunTime: Date;
}

async function run(): Promise<void> {
  try {
    const token: string = core.getInput('token');
    const owner: string = core.getInput('owner');
    const repo: string = core.getInput('repo');
    
    const octokit = new Octokit({ auth: token });

    const { data: workflows } = await octokit.actions.listRepoWorkflows({
      owner,
      repo,
    });

    console.log(`Most recent workflow runs for ${owner}/${repo}:`);

    const workflowInfos: WorkflowRunInfo[] = [];

    for (const workflow of workflows.workflows) {
      const { data: runs } = await octokit.actions.listWorkflowRuns({
        owner,
        repo,
        workflow_id: workflow.id,
        per_page: 1,
      });

      if (runs.total_count > 0) {
        const latestRun = runs.workflow_runs[0];
        workflowInfos.push({
          name: workflow.name,
          status: latestRun.status,
          conclusion: latestRun.conclusion,
          lastRunTime: new Date(latestRun.created_at)
        });
      }
    }

    // Sort workflows by last run time, most recent first
    workflowInfos.sort((a, b) => b.lastRunTime.getTime() - a.lastRunTime.getTime());

    // Output sorted workflow information
    workflowInfos.forEach(info => {
      const runTime = info.lastRunTime.toLocaleString('en-US', { timeZone: 'UTC' });
      console.log(`${info.name} - Status: ${info.status}, Conclusion: ${info.conclusion}, Last Run: ${runTime} UTC`);
    });

    // You can add more detailed processing or notifications here

  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    } else {
      core.setFailed('An unexpected error occurred');
    }
  }
}

run();