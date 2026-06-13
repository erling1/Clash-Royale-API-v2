# Latest Amazon Linux 2023 AMI for x86_64 (matches t3.micro).
data "aws_ssm_parameter" "al2023" {
  name = "/aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-x86_64"
}

resource "aws_key_pair" "admin" {
  count      = var.ssh_public_key == "" ? 0 : 1
  key_name   = "clashroyale-admin"
  public_key = var.ssh_public_key
}

resource "aws_instance" "app" {
  ami                    = data.aws_ssm_parameter.al2023.value
  instance_type          = var.instance_type
  subnet_id              = data.aws_subnet.chosen.id
  vpc_security_group_ids = [aws_security_group.app.id]
  iam_instance_profile   = aws_iam_instance_profile.instance.name
  key_name               = var.ssh_public_key == "" ? null : aws_key_pair.admin[0].key_name

  associate_public_ip_address = true

  root_block_device {
    volume_size = var.root_volume_gb
    volume_type = "gp3"
    encrypted   = true
  }

  # gzip-compressed so the rendered cloud-init stays under EC2's 16 KiB
  # user_data limit. cloud-init auto-detects the gzip magic bytes and
  # decompresses before running.
  user_data_base64 = base64gzip(templatefile("${path.module}/templates/cloud-init.yaml.tftpl", {
    region            = var.aws_region
    ghcr_owner        = var.ghcr_owner
    ghcr_pat_param    = var.ghcr_pat_param
    api_image         = var.api_image
    frontend_image    = var.frontend_image
    pipeline_image    = var.pipeline_image
    cr_token_param    = var.cr_token_param
    quack_token_param = var.quack_token_param
    domain            = var.domain
    cr_pipeline_sh    = file("${path.module}/scripts/cr-pipeline.sh")
  }))

  # Don't let a routine `tofu apply` destroy the running box (and its DuckDB)
  # just because cloud-init changed. To intentionally roll out cloud-init
  # changes, replace the instance explicitly:
  #   tofu apply -replace=aws_instance.app
  lifecycle {
    ignore_changes = [user_data_base64]
  }

  tags = { Name = "clashroyale-app" }
}

# Static address: stable target for DNS, and the IP you whitelist for the
# Clash Royale API token (the pipeline calls Supercell from this IP).
resource "aws_eip" "app" {
  instance = aws_instance.app.id
  domain   = "vpc"
  tags     = { Name = "clashroyale-app" }
}
