import axios from 'axios';
import { fetchGitRemoteOriginURL } from '../../utils/git';
import { extractBaseUrl, extractProjectPath, getGitLabToken } from '../../utils/helper';

export const createGitlabMR = async () => {
  const { stdout: remoteUrl } = await fetchGitRemoteOriginURL();
  console.log({ remoteUrl });
  const projectPath = extractProjectPath(remoteUrl) || '';
  console.log({ projectPath });
  const encodedProject = encodeURIComponent(projectPath);
  const baseUrl = extractBaseUrl(remoteUrl) || '';
  const url = `${baseUrl}/api/v4/projects/${encodedProject}/merge_requests`;

  const res = await axios.post(
    url,
    {
      source_branch: 'test',
      target_branch: 'main',
      title: 'Test MR from AI-SHIP',
      description: 'Test MR from AI-SHIP',
    },
    {
      headers: {
        'PRIVATE-TOKEN': getGitLabToken() || '',
      },
    },
  );
  return res.data;
};
