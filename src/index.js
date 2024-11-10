import "dotenv/config";
import express from "express";
import cors from "cors";

let port = +process.env.WEBHOOK_PORT;
if (isNaN(port) || port < 0 || port > 65535) {
  console.error(`Invalid port number: ${port}. Using default port 3000.`);
  port = 3000;
}

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const router = express.Router();

router.post("/webhook", (req, res) => {
  // Handle webhook POST request
  const body = req.body;
  console.log("Body:", body);

  res.status(200).json({ message: "Webhook received" });
});

app.use("/api/v1", router);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}...`);
});

const onMRCreate = {
  object_kind: "merge_request",
  event_type: "merge_request",
  user: {
    id: 10712933,
    name: "Petar Petrov",
    username: "PetarNenovPetrov",
    avatar_url:
      "https://gitlab.com/uploads/-/system/user/avatar/10712933/avatar.png",
    email: "[REDACTED]",
  },
  project: {
    id: 62971182,
    name: "ai-code-review",
    description: null,
    web_url: "https://gitlab.com/f2626/ai-code-review",
    avatar_url: null,
    git_ssh_url: "git@gitlab.com:f2626/ai-code-review.git",
    git_http_url: "https://gitlab.com/f2626/ai-code-review.git",
    namespace: "front",
    visibility_level: 0,
    path_with_namespace: "f2626/ai-code-review",
    default_branch: "main",
    ci_config_path: "",
    homepage: "https://gitlab.com/f2626/ai-code-review",
    url: "git@gitlab.com:f2626/ai-code-review.git",
    ssh_url: "git@gitlab.com:f2626/ai-code-review.git",
    http_url: "https://gitlab.com/f2626/ai-code-review.git",
  },
  object_attributes: {
    assignee_id: null,
    author_id: 10712933,
    created_at: "2024-11-10T10:48:55.243Z",
    description: "",
    draft: false,
    head_pipeline_id: null,
    id: 341829326,
    iid: 17,
    last_edited_at: null,
    last_edited_by_id: null,
    merge_commit_sha: "2ff7b19d97341bf39daf6141c50bcab19ffa6ca3",
    merge_error: null,
    merge_params: {
      force_remove_source_branch: "1",
      should_remove_source_branch: true,
    },
    merge_status: "can_be_merged",
    merge_user_id: null,
    merge_when_pipeline_succeeds: false,
    milestone_id: null,
    source_branch: "refactor",
    source_project_id: 62971182,
    state_id: 3,
    target_branch: "main",
    target_project_id: 62971182,
    time_estimate: 0,
    title: "refactor update styles",
    updated_at: "2024-11-10T14:18:34.346Z",
    updated_by_id: null,
    prepared_at: "2024-11-10T10:48:56.477Z",
    assignee_ids: [],
    blocking_discussions_resolved: true,
    detailed_merge_status: "not_open",
    first_contribution: false,
    human_time_change: null,
    human_time_estimate: null,
    human_total_time_spent: null,
    labels: [],
    last_commit: {
      id: "75837f790ba093809520c2e1bafdbe4aea6876f4",
      message: "refactor fix: naming\n",
      title: "refactor fix: naming",
      timestamp: "2024-11-10T16:13:51+02:00",
      url: "https://gitlab.com/f2626/ai-code-review/-/commit/75837f790ba093809520c2e1bafdbe4aea6876f4",
      author: [Object],
    },
    reviewer_ids: [],
    source: {
      id: 62971182,
      name: "ai-code-review",
      description: null,
      web_url: "https://gitlab.com/f2626/ai-code-review",
      avatar_url: null,
      git_ssh_url: "git@gitlab.com:f2626/ai-code-review.git",
      git_http_url: "https://gitlab.com/f2626/ai-code-review.git",
      namespace: "front",
      visibility_level: 0,
      path_with_namespace: "f2626/ai-code-review",
      default_branch: "main",
      ci_config_path: "",
      homepage: "https://gitlab.com/f2626/ai-code-review",
      url: "git@gitlab.com:f2626/ai-code-review.git",
      ssh_url: "git@gitlab.com:f2626/ai-code-review.git",
      http_url: "https://gitlab.com/f2626/ai-code-review.git",
    },
    state: "merged",
    target: {
      id: 62971182,
      name: "ai-code-review",
      description: null,
      web_url: "https://gitlab.com/f2626/ai-code-review",
      avatar_url: null,
      git_ssh_url: "git@gitlab.com:f2626/ai-code-review.git",
      git_http_url: "https://gitlab.com/f2626/ai-code-review.git",
      namespace: "front",
      visibility_level: 0,
      path_with_namespace: "f2626/ai-code-review",
      default_branch: "main",
      ci_config_path: "",
      homepage: "https://gitlab.com/f2626/ai-code-review",
      url: "git@gitlab.com:f2626/ai-code-review.git",
      ssh_url: "git@gitlab.com:f2626/ai-code-review.git",
      http_url: "https://gitlab.com/f2626/ai-code-review.git",
    },
    time_change: 0,
    total_time_spent: 0,
    url: "https://gitlab.com/f2626/ai-code-review/-/merge_requests/17",
    work_in_progress: false,
    approval_rules: [],
    action: "open",
  },
  labels: [],
  changes: {},
  repository: {
    name: "ai-code-review",
    url: "git@gitlab.com:f2626/ai-code-review.git",
    description: null,
    homepage: "https://gitlab.com/f2626/ai-code-review",
  },
};
