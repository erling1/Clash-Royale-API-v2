# Cloudflare A record → Elastic IP, proxied (orange cloud) for free TLS,
# caching, and origin-egress shielding. Created only if you set the zone id.
#
# Cloudflare provider v5 uses `cloudflare_dns_record` with `content` (not the
# old v4 `cloudflare_record` / `value`).

resource "cloudflare_dns_record" "app" {
  count = var.cloudflare_zone_id == "" ? 0 : 1

  zone_id = var.cloudflare_zone_id
  name    = var.domain
  content = aws_eip.app.public_ip
  type    = "A"
  proxied = true
  ttl     = 1 # 1 = "automatic"; required when proxied
}
