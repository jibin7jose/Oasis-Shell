import json
import math
import os

def forecast_venture():
    try:
        cache_path = ".oracle_cache.json"
        if not os.path.exists(cache_path):
            print(json.dumps({"error": "Cache file not found"}))
            return

        with open(cache_path, "r") as f:
            venture = json.load(f)
        
        # Neural Extraction
        arr = float(venture['metrics']['arr'].replace('$', '').replace('M', ''))
        burn = float(venture['metrics']['burn'].replace('$', '').replace('K/mo', '').replace('M', '000')) / 1000.0 # Normalized to Millions/mo
        momentum = float(venture['metrics']['momentum'].replace('+', '').replace('%', '')) / 100.0
        sentiment = venture.get('market', {}).get('sentiment', 'Neutral').lower()
        
        # Sentiment Multiplier
        sentiment_mod = 1.0
        if 'bear' in sentiment:
            sentiment_mod = 0.7
        elif 'bull' in sentiment or 'hypergrowth' in sentiment:
            sentiment_mod = 1.3
            
        # 12-Month Harmonic Projection with Risk/Opportunity Scenarios
        scenarios = {
            "pessimistic": [],
            "baseline": [],
            "optimistic": []
        }
        
        for scenario, points in scenarios.items():
            current = arr
            mod = 0.8 if scenario == "pessimistic" else (1.2 if scenario == "optimistic" else 1.0)
            
            for i in range(1, 13):
                # Sigmoid decay for saturation + sentiment modifier
                decay = 1.0 / (1.0 + math.exp(i - 10))
                growth = (momentum / 12.0 * decay * sentiment_mod * mod)
                
                # Deduct burn (simplified)
                # current -= burn 
                # Actually, let's keep it as revenue-only projection for now to match the UI expectation
                current *= 1.0 + growth
                points.append(round(current, 3))
                
        # Confidence calculation based on runway and burn stability
        runway = float(venture['metrics']['runway'].replace(' Mo.', '').replace('Mo', ''))
        confidence = 0.85
        if runway < 6: confidence -= 0.2
        if 'bear' in sentiment: confidence -= 0.1
        
        result = {
            "venture_id": venture['id'],
            "projected_arr": f"${scenarios['baseline'][-1]}M",
            "prediction_confidence": round(max(0.1, confidence), 2),
            "trend_points": scenarios['baseline'],
            "scenarios": scenarios,
            "recommendation": f"Oracle Sigil: {'Pivot Recommended' if runway < 10 else 'Steady Path'} @ {round(confidence * 100, 1)}% Probability"
        }
        
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    forecast_venture()
