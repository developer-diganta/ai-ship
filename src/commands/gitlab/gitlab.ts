import axios from 'axios';
import { fetchGitRemoteOriginURL } from '../../utils/git';
import { extractBaseUrl, extractProjectPath, getGitLabToken } from '../../utils/helper';

export const createGitlabMR = async ({
  title,
  description,
  sourceBranch,
  targetBranch,
}: {
  title: string;
  description: string;
  sourceBranch: string;
  targetBranch: string;
}) => {
  const { stdout: remoteUrl } = await fetchGitRemoteOriginURL();
  const projectPath = extractProjectPath(remoteUrl) || '';
  const encodedProject = encodeURIComponent(projectPath);
  const baseUrl = extractBaseUrl(remoteUrl) || '';
  const url = `${baseUrl}/api/v4/projects/${encodedProject}/merge_requests`;

  const res = await axios.post(
    url,
    {
      source_branch: sourceBranch,
      target_branch: targetBranch,
      title: title,
      description: description,
    },
    {
      headers: {
        'PRIVATE-TOKEN': getGitLabToken() || '',
      },
    },
  );
  return res.data;
};
