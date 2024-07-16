import * as core from '@actions/core';
import { Octokit } from '@octokit/rest';

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

    for (const workflow of workflows.workflows) {
      const { data: runs } = await octokit.actions.listWorkflowRuns({
        owner,
        repo,
        workflow_id: workflow.id,
        per_page: 1,
      });

      if (runs.total_count > 0) {
        const latestRun = runs.workflow_runs[0];
        const runTime = new Date(latestRun.created_at).toLocaleString('en-US', { timeZone: 'UTC' });
        console.log(`${workflow.name} - Status: ${latestRun.status}, Conclusion: ${latestRun.conclusion}, Last Run: ${runTime} UTC`);
      } else {
        console.log(`${workflow.name} - No runs`);
      }
    }

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