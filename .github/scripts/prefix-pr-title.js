module.exports = async ({ github, context }) => {
  const pr = context.payload.pull_request;
  const branch = pr.head.ref;
  const currentTitle = pr.title;

  let prefix = null;

  if (branch.startsWith('feat/')) prefix = '[Feature]';
  else if (branch.startsWith('fix/')) prefix = '[Fix]';
  else if (branch.startsWith('chore/')) prefix = '[Chore]';
  else if (branch.startsWith('docs/')) prefix = '[Docs]';

  if (prefix && !currentTitle.startsWith(prefix)) {
    await github.rest.pulls.update({
      owner: context.repo.owner,
      repo: context.repo.repo,
      pull_number: pr.number,
      title: `${prefix} ${currentTitle}`
    });
    console.log(`Updated title to: ${prefix} ${currentTitle}`);
  }
};
