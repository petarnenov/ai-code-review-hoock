import "dotenv/config";
import axios from "axios";
import OpenAI from "openai";
import { DEFAULT_OPEN_AI_REACT_PROMPT } from "./consts.js";

import addLinesToDiff from "../utils/addLinesToDiff.js";
import getFileContent from "../utils/getFileContent.js";

const GITLAB_API_URL = "https://gitlab.com/api/v4";
const GITLAB_TOKEN = process.env.GITLAB_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const configuration = {
  apiKey: OPENAI_API_KEY,
};

const openai = new OpenAI(configuration);

const mergeRequestBody = {
  project: {
    id: 62971182,
  },
  object_attributes: {
    iid: 18,
  },
};

async function getDiffsFromGitLab(projectId, mergeRequestIid) {
  try {
    const response = await axios.get(
      `${GITLAB_API_URL}/projects/${projectId}/merge_requests/${mergeRequestIid}/changes`,
      {
        headers: {
          "PRIVATE-TOKEN": GITLAB_TOKEN,
        },
      }
    );
    return response.data.changes;
  } catch (error) {
    console.error("Error fetching diffs from GitLab:", error);
    throw error;
  }
}

async function getFile(projectId, filepath, branchName) {
  try {
    const response = await axios.get(
      `${GITLAB_API_URL}/projects/${projectId}/repository/files/${encodeURIComponent(
        filepath
      )}/`,
      {
        headers: {
          "PRIVATE-TOKEN": GITLAB_TOKEN,
        },
        params: {
          ref: encodeURIComponent(branchName),
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching diffs from GitLab:", error);
    throw error;
  }
}

async function getCodeReviewFromOpenAI(diffs) {
  const prompt = DEFAULT_OPEN_AI_REACT_PROMPT;

  const content = JSON.stringify(diffs);

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: [
            {
              type: "text",
              text: prompt,
            },
          ],
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: content,
            },
          ],
        },
      ],
    });
    return response.choices[0].message.content;
  } catch (error) {
    console.error("Error getting code review from OpenAI:", error);
    throw error;
  }
}

async function postCommentToGitLab(projectId, mergeRequestIid, comment) {
  try {
    await axios.post(
      `${GITLAB_API_URL}/projects/${projectId}/merge_requests/${mergeRequestIid}/notes`,
      {
        body: comment,
      },
      {
        headers: {
          "PRIVATE-TOKEN": GITLAB_TOKEN,
        },
      }
    );
    console.log("Comment posted successfully to GitLab");
  } catch (error) {
    console.error("Error posting comment to GitLab:", error);
    throw error;
  }
}

export function parseJsonReviewString(reviewString) {
  try {
    // Remove the Markdown code block syntax
    const cleanedString = reviewString.replace(/^```json\n|\n```$/g, "");

    // Parse the cleaned string
    const parsedReviewString = JSON.parse(cleanedString);

    return parsedReviewString;
  } catch (error) {
    console.error("Error parsing JSON string:", error);
    return null;
  }
}

export async function getMergeRequestVersions(projectId, mergeRequestIid) {
  try {
    const response = await axios.get(
      `${GITLAB_API_URL}/projects/${projectId}/merge_requests/${mergeRequestIid}/versions`,
      {
        headers: {
          "PRIVATE-TOKEN": GITLAB_TOKEN,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching merge request versions:", error);
    throw error;
  }
}

async function postComments(comment, projectId, mergeRequestIid, versions) {
  const formData = new FormData();

  formData.append("position[position_type]", "text");
  formData.append("position[base_sha]", versions?.[0].base_commit_sha);
  formData.append("position[head_sha]", versions?.[0].head_commit_sha);
  formData.append("position[start_sha]", versions?.[0].start_commit_sha);
  formData.append("position[new_path]", comment?.new_path);
  formData.append("position[old_path]", comment?.old_path || comment?.new_path);
  formData.append("position[new_line]", comment?.nln);

  formData.append(
    "body",
    `${comment?.reviewComment}Snippet:<pre><code>${comment?.snippet}</code></pre>`
  );

  try {
    await axios.post(
      `${GITLAB_API_URL}/projects/${projectId}/merge_requests/${mergeRequestIid}/discussions`,
      formData,
      {
        headers: {
          "PRIVATE-TOKEN": GITLAB_TOKEN,
          "Content-Type": "multipart/form-data",
        },
      }
    );
    console.log("Comment posted successfully to GitLab");
  } catch (error) {
    console.warn("Error posting comment to GitLab:", comment);
    console.error("Error posting comment to GitLab:", error);
    //throw error;
  }
}

async function postAllComments(comments, projectId, mergeRequestIid, versions) {
  try {
    return Promise.all(
      comments.map(async (comment) => {
        await postComments(comment, projectId, mergeRequestIid, versions);
      })
    );
  } catch (error) {
    console.error("Error posting all comments to GitLab:", error);
    //throw error;
  }
}

async function listMergeRequestDiffs(projectId, mergeRequestIid) {
  try {
    const response = await axios.get(
      `${GITLAB_API_URL}/projects/${projectId}/merge_requests/${mergeRequestIid}/diffs`,
      {
        headers: {
          "PRIVATE-TOKEN": GITLAB_TOKEN,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching merge request diffs:", error);
    throw error;
  }
}

async function processCodeReview() {
  const projectId = mergeRequestBody.project.id;
  const mergeRequestIid = mergeRequestBody.object_attributes.iid;

  try {
    // 1. Get diffs from GitLab
    const diffs = await listMergeRequestDiffs(projectId, mergeRequestIid);
    console.log("Diffs fetched successfully from GitLab");
    //2. Add line numbers to diffs
    const diffsWithLineNumbers = addLinesToDiff(diffs);
    console.log("Line numbers added successfully to diffs");
    //3. Get file paths from the diffs
    const filePaths = diffs.map((diff) => diff.new_path);
    console.log("File paths fetched successfully from diffs");
    //4. Get files from the file paths
    const files = await Promise.all(
      filePaths.map((filePath) => getFile(projectId, filePath, "add-contact"))
    );
    console.log("Files fetched successfully from GitLab");
    //5. Get file contents from the files
    const fileContents = files.map((file) => getFileContent(file));
    console.log("File contents fetched successfully from files");
    //6. Combine the file contents with the diffs
    const combinedContent = fileContents.map(
      (content, index) => `${content}\n\n\n${diffsWithLineNumbers[index]}`
    );
    console.log("Combined content fetched successfully");
    //7. Get code review from OpenAI
    const review = await getCodeReviewFromOpenAI(combinedContent);
    console.log("Code review fetched successfully from OpenAI");
    //8. Parse the code review from OpenAI
    const comments = parseJsonReviewString(review);
    console.log("Code review parsed successfully");
    //9. Get the versions of the merge request
    const versions = await getMergeRequestVersions(projectId, mergeRequestIid);
    console.log("Merge request versions fetched successfully");
    //10. Apply the comments to the merge request
    // if (comments && comments.length > 0) {
    //   const res = await postComments(
    //     comments[0],
    //     projectId,
    //     mergeRequestIid,
    //     versions
    //   );
    //   console.log("Comments posted successfully to GitLab", res);
    // }
    await postAllComments(comments, projectId, mergeRequestIid, versions);
    console.log(
      `Code review process completed successfully: Project(${projectId}), Merge Request(${mergeRequestIid}), Comments(${comments.length})`
    );
  } catch (error) {
    console.error("Error in code review process:", error);
  }
}

// Export the main function to be called from your application
export { processCodeReview };
