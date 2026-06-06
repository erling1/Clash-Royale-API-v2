# CI/CD: lets the build-and-push GitHub Actions workflow redeploy the running
# box (pull new images + recreate containers) via SSM — with NO long-lived AWS
# keys in GitHub. Auth is GitHub OIDC -> a tightly scoped IAM role.
#
# After `tofu apply`, set the role ARN as a GitHub repo *variable* (not secret):
#   gh variable set AWS_DEPLOY_ROLE_ARN -R erling1/Clash-Royale-API-v2 \
#     --body "$(tofu output -raw github_deploy_role_arn)"

variable "github_repo" {
  description = "owner/repo allowed to assume the deploy role via OIDC"
  type        = string
  default     = "erling1/Clash-Royale-API-v2"
}

# GitHub's OIDC identity provider. On AWS provider v5 the thumbprint is derived
# automatically for this well-known host, so thumbprint_list is omitted.
resource "aws_iam_openid_connect_provider" "github" {
  url            = "https://token.actions.githubusercontent.com"
  client_id_list = ["sts.amazonaws.com"]
}

# Trust: only this repo, only the main branch, may assume the role.
data "aws_iam_policy_document" "github_assume" {
  statement {
    actions = ["sts:AssumeRoleWithWebIdentity"]
    principals {
      type        = "Federated"
      identifiers = [aws_iam_openid_connect_provider.github.arn]
    }
    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:aud"
      values   = ["sts.amazonaws.com"]
    }
    condition {
      test     = "StringLike"
      variable = "token.actions.githubusercontent.com:sub"
      values   = ["repo:${var.github_repo}:ref:refs/heads/main"]
    }
  }
}

resource "aws_iam_role" "github_deploy" {
  name               = "clashroyale-github-deploy"
  assume_role_policy = data.aws_iam_policy_document.github_assume.json
}

# Least privilege: run AWS-RunShellScript on THIS instance only, plus the
# read calls needed to find the instance and track the command result.
data "aws_iam_policy_document" "github_deploy" {
  statement {
    sid     = "RunShellOnAppInstance"
    actions = ["ssm:SendCommand"]
    resources = [
      "arn:aws:ec2:${var.aws_region}:${data.aws_caller_identity.current.account_id}:instance/${aws_instance.app.id}",
      "arn:aws:ssm:${var.aws_region}::document/AWS-RunShellScript",
    ]
  }
  statement {
    sid       = "TrackCommandResult"
    actions   = ["ssm:GetCommandInvocation", "ssm:ListCommandInvocations"]
    resources = ["*"]
  }
  statement {
    sid       = "FindInstanceByTag"
    actions   = ["ec2:DescribeInstances"]
    resources = ["*"]
  }
}

resource "aws_iam_role_policy" "github_deploy" {
  name   = "deploy"
  role   = aws_iam_role.github_deploy.id
  policy = data.aws_iam_policy_document.github_deploy.json
}

output "github_deploy_role_arn" {
  description = "Set this as the AWS_DEPLOY_ROLE_ARN GitHub repo variable."
  value       = aws_iam_role.github_deploy.arn
}
