use crate::{AgentBranch, NeuralAgent, PendingManifest, NeuralWisdom};

pub fn neural_wisdom_for_color(stress_color: &str) -> NeuralWisdom {
    if stress_color == "#ef4444" || stress_color == "#f59e0b" {
        NeuralWisdom {
            recommendation: "Re-activate 'Series A Outreach' module immediately.".into(),
            insight: "Last successful pivot (2026-03-12) resulted in +14.2% ARR growth within 7 days.".into(),
            confidence: 0.94,
        }
    } else {
        NeuralWisdom {
            recommendation: "System Stable. Focus on 'Strategic Innovation' nodes.".into(),
            insight: "Venture Equilibrium maintained for 18.5 consecutive cycles.".into(),
            confidence: 0.98,
        }
    }
}

pub fn pending_manifests_for_color(stress_color: &str) -> Vec<PendingManifest> {
    if stress_color == "#ef4444" {
        vec![PendingManifest {
            id: "pivot_01".into(),
            title: "Emergency Pivot Audit".into(),
            rationale: "Venture stress is critical. Auditor suggests immediate runway-burn decoupling.".into(),
            code_draft: "export const PivotAudit = () => { console.log('Critical Pivot Node Active'); }".into(),
        }]
    } else {
        vec![PendingManifest {
            id: "growth_01".into(),
            title: "Scaling Momentum Node".into(),
            rationale: "Internal momentum is high. Growth Op suggests architecting a referral engine.".into(),
            code_draft: "export const GrowthEngine = () => { console.log('Scaling Momentum Engine Active'); }".into(),
        }]
    }
}

pub fn market_bias_label(market_index: f32) -> &'static str {
    if market_index < 90.0 {
        "EMERALD_BIAS (Safe)"
    } else {
        "RUBY_BIAS (Aggressive)"
    }
}

pub fn neural_workforce_for_market_index(market_index: f32) -> Vec<NeuralAgent> {
    let market_bias = market_bias_label(market_index);
    let mut workforce = vec![
        NeuralAgent {
            id: "auditor".into(),
            name: "Neural Auditor".into(),
            role: "Financial Sentinel".into(),
            status: format!("Market Aware: {}", market_bias),
            recommendation: "Sector divergence detected. Pivot emerald for capital preservation.".into(),
            branches: vec![
                AgentBranch { tag: "emerald".into(), title: "Emerald Path".into(), description: "Conservative Burn Reduction.".into(), risk_level: "Minimal".into() },
                AgentBranch { tag: "ruby".into(), title: "Ruby Path".into(), description: "Aggressive ARR Expansion.".into(), risk_level: "High Risk (Market Divergence)".into() },
            ],
        },
        NeuralAgent {
            id: "growth".into(),
            name: "The Expansion Golem".into(),
            role: "Viral Architect".into(),
            status: "Monitoring Market Momentum".into(),
            recommendation: "Internal momentum is diverging from SaaS core trends by 12.8%.".into(),
            branches: vec![
                AgentBranch { tag: "organic".into(), title: "Organic Link".into(), description: "Community-led retention focus.".into(), risk_level: "Market Verified".into() },
                AgentBranch { tag: "paid".into(), title: "Capital Injection".into(), description: "Paid acquisition sprint.".into(), risk_level: "High Burn (Market Conflict)".into() },
            ],
        },
    ];

    let path = ".golem_registry.json";
    if std::path::Path::new(path).exists() {
        let data = std::fs::read_to_string(path).unwrap_or_default();
        let mut registered: Vec<NeuralAgent> = serde_json::from_str(&data).unwrap_or_default();
        workforce.append(&mut registered);
    }

    workforce
}

#[cfg(test)]
mod tests {
    use super::{market_bias_label, neural_wisdom_for_color, pending_manifests_for_color};

    #[test]
    fn wisdom_switches_on_warning_colors() {
        assert_eq!(
            neural_wisdom_for_color("#ef4444").recommendation,
            "Re-activate 'Series A Outreach' module immediately."
        );
        assert_eq!(
            neural_wisdom_for_color("#10b981").recommendation,
            "System Stable. Focus on 'Strategic Innovation' nodes."
        );
    }

    #[test]
    fn pending_manifests_follow_stress_color() {
        assert_eq!(pending_manifests_for_color("#ef4444")[0].id, "pivot_01");
        assert_eq!(pending_manifests_for_color("#10b981")[0].id, "growth_01");
    }

    #[test]
    fn market_bias_labels_track_threshold() {
        assert_eq!(market_bias_label(50.0), "EMERALD_BIAS (Safe)");
        assert_eq!(market_bias_label(90.0), "RUBY_BIAS (Aggressive)");
    }
}
