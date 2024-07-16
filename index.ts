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
    });

    console.log(`Recent workflow runs for ${owner}/${repo}:`);
    workflowRuns.workflow_runs.forEach(run => {
      console.log(`${run.name} - Status: ${run.status}, Conclusion: ${run.conclusion}`);
    });
    // add slack notification here
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