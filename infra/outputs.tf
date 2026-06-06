output "public_ip" {
  description = "Elastic IP. Point DNS here AND whitelist it for your CR API token."
  value       = aws_eip.app.public_ip
}

output "instance_id" {
  value = aws_instance.app.id
}

output "ssm_session_command" {
  description = "Shell into the box with no open SSH port."
  value       = "aws ssm start-session --target ${aws_instance.app.id} --region ${var.aws_region}"
}

output "app_url" {
  value = var.domain == "" ? "http://${aws_eip.app.public_ip}" : "https://${var.domain}"
}
