# AWS has no hard spend cap, so this is your tripwire: email alerts at 80% of
# (forecast) a small monthly threshold. Combined with fixed compute + no
# autoscaling, this is your protection against egress-driven surprises.

variable "monthly_budget_usd" {
  type    = number
  default = 10
}

variable "budget_email" {
  type    = string
  default = "erling.nupen@egmont.com"
}

resource "aws_budgets_budget" "monthly" {
  name         = "clashroyale-monthly"
  budget_type  = "COST"
  limit_amount = tostring(var.monthly_budget_usd)
  limit_unit   = "USD"
  time_unit    = "MONTHLY"

  # Alert when ACTUAL spend crosses 80%.
  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                  = 80
    threshold_type             = "PERCENTAGE"
    notification_type          = "ACTUAL"
    subscriber_email_addresses = [var.budget_email]
  }

  # Alert when FORECAST spend would exceed 100%.
  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                  = 100
    threshold_type             = "PERCENTAGE"
    notification_type          = "FORECASTED"
    subscriber_email_addresses = [var.budget_email]
  }
}
