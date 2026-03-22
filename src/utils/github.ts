export const createGithubPR = async ({
  title,
  body,
  base = 'main',
  head,
}: {
  title: string;
  body: string;
  base?: string;
  head: string;
}) => {
  try {
    await createGithubPR({ title, body, base, head });
  } catch (error) {
    console.error('Failed to create GitHub PR.');

    throw error;
  }
};
