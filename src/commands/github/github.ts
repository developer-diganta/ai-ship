import asyncExecuter from '../../utils/asyncExecuter';

export const createPR = async ({
  title,
  body,
  base = 'main',
  head,
}: {
  title: string;
  body: string;
  base?: string;
  head: string;
}) =>
  await asyncExecuter(
    `gh pr create --title "${escape(title)}" --body "${escape(
      body,
    )}" --base ${base} --head ${head}`,
  );
