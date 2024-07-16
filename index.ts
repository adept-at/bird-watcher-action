import * as core from '@actions/core';
import { Octokit } from '@octokit/rest';

async function run(): Promise<void> {
  try {
    const token: string = core.getInput('token');
    const owner: string = core.getInput('owner');
    const repo: string = core.getInput('repo');
    
    const octokit = new Octokit({ auth: token });

    const { data: workflowRuns } = await octokit.actions.listWorkflowRunsForRepo({
      owner,
      repo,
      per_page: 100, // Increase this if you have more workflows
    });

    console.log(`Most recent workflow runs for ${owner}/${repo}:`);

    // Group workflows by name and get the most recent run
    const latestRuns = new Map<string, typeof workflowRuns.workflow_runs[0]>();
    workflowRuns.workflow_runs.forEach(run => {
      if (!latestRuns.has(run.name) || run.created_at > latestRuns.get(run.name)!.created_at) {
        latestRuns.set(run.name, run);
      }
    });

    // Output the latest run for each workflow
    latestRuns.forEach((run, workflowName) => {
      console.log(`${workflowName} - Status: ${run.status}, Conclusion: ${run.conclusion}`);
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