import json
import os

class ConfigLoader:
    def __init__(self):
        self.configs = {}
        self.load_all_configs()
    
    def load_all_configs(self):
        """Load all configuration files"""
        config_files = {
            'calculatorDefaults': 'calculatorDefaults.json',
            'costMap': 'costMap.json', 
            'defaults': 'defaults.json',
            'orgMapping': 'orgMapping.json'
        }
        
        for config_name, filename in config_files.items():
            self.configs[config_name] = self.load_config_file(filename)
    
    def load_config_file(self, filename):
        """
        Load a specific config file from multiple possible locations
        """
        possible_paths = [
            # For Lambda deployment
            f"/opt/assets/config/{filename}",
            # For local development
            f"./frontend/assets/config/{filename}",
            f"../frontend/assets/config/{filename}",
            f"./assets/config/{filename}",
            # Absolute path fallback
            os.path.join(os.path.dirname(__file__), f'../frontend/assets/config/{filename}')
        ]
        
        for path in possible_paths:
            if os.path.exists(path):
                try:
                    with open(path, 'r') as f:
                        config_data = json.load(f)
                        print(f"✅ Loaded {filename} from {path}")
                        return config_data
                except Exception as e:
                    print(f"❌ Error loading {filename} from {path}: {e}")
        
        # Return fallback defaults if file not found
        print(f"⚠️  {filename} not found, using fallback defaults")
        return self.get_fallback_config(filename)
    
    def get_fallback_config(self, filename):
        """Provide fallback configuration when files are missing"""
        fallbacks = {
            'calculatorDefaults.json': {
                "defaults": {
                    "prod_cpu_req": 128000,
                    "nonprod_cpu_req": 6000,
                    "standard_pod_cpu": 1000,
                    "standard_pod_memory": 4096
                },
                "pricing": {
                    # FIXED: Changed from S,M,L to Tier1,Tier2,Tier3
                    "Tier1": { "cpu_max": 8, "monthly": 413.46 },
                    "Tier2": { "cpu_max": 16, "monthly": 583.84 },
                    "Tier3": { "cpu_max": 32, "monthly": 1102.56 },
                    "Tier4": { "cpu_max": 64, "monthly": 2205.12 }
                }
            },
            'costMap.json': {
                # FIXED: Changed from S,M,L to Tier1,Tier2,Tier3
                "Tier1": 413.46,
                "Tier2": 583.84,
                "Tier3": 1102.56,
                "Tier4": 2205.12
            },
            'defaults.json': {
                "prod": {
                    "cpu": 64,
                    "memory": "256Gi",
                    "storage": "1Ti"
                },
                "nonprod": {
                    "cpu": 16,
                    "memory": "64Gi",
                    "storage": "256Gi"
                },
                "dev": "nonprod"
            },
            'orgMapping.json': [
                {
                    "approver": "Abi Baltazar",
                    "tribes": {
                        "funds": [
                            "bank_cashin",
                            "bank_transfer",
                            "offline_cico",
                            "p2p_and_padala",
                            "funds_runway",
                            "funds_ktlo"
                        ]
                    }
                }
                # ... (include all your orgMapping data here as fallback)
            ]
        }
        return fallbacks.get(filename, {})
    
    def get_calculator_defaults(self):
        return self.configs.get('calculatorDefaults', {})
    
    def get_cost_map(self):
        return self.configs.get('costMap', {})
    
    def get_defaults(self):
        return self.configs.get('defaults', {})
    
    def get_org_mapping(self):
        return self.configs.get('orgMapping', [])
    
    def get_pricing(self, provisioner):
        """Get pricing for a specific provisioner - FIXED for Tier pricing"""
        calculator_defaults = self.get_calculator_defaults()
        cost_map = self.get_cost_map()
        
        # Try calculatorDefaults first, then costMap as fallback
        pricing_data = calculator_defaults.get('pricing', {})
        
        # FIXED: Support both old (S,M,L) and new (Tier1,Tier2,Tier3) provisioner names
        if provisioner in pricing_data:
            return pricing_data[provisioner].get('monthly')
        
        # Also check costMap
        if provisioner in cost_map:
            return cost_map.get(provisioner)
        
        # Fallback pricing for Tiers
        tier_pricing = {
            "Tier1": 413.46,
            "Tier2": 583.84, 
            "Tier3": 1102.56,
            "Tier4": 2205.12
        }
        
        return tier_pricing.get(provisioner, 413.46)  # Default to Tier1
    
    def get_environment_defaults(self, env):
        """Get defaults for a specific environment"""
        defaults = self.get_defaults()
        
        # Handle dev -> nonprod mapping
        if env == 'dev':
            env = defaults.get('dev', 'nonprod')
        
        return defaults.get(env, defaults.get('nonprod', {}))
    
    def find_approver(self, tribe_name):
        """Find approver for a specific tribe"""
        org_mapping = self.get_org_mapping()
        
        for approver_data in org_mapping:
            approver = approver_data.get('approver', '')
            tribes = approver_data.get('tribes', {})
            
            for category, tribe_list in tribes.items():
                if tribe_name in tribe_list:
                    return approver
        
        return "Unknown Approver"

# Global config loader instance
config_loader = ConfigLoader()