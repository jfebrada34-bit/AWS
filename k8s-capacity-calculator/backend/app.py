import json
import math
from datetime import datetime

def lambda_handler(event, context):
    """
    Main Lambda handler - replaces Flask routes
    """
    print("Received event:", json.dumps(event))
    
    # Extract HTTP method and path
    http_method = event.get('httpMethod', 'GET')
    path = event.get('path', '')
    
    # Handle CORS headers
    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Credentials': True
    }
    
    # Handle CORS preflight
    if http_method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': ''
        }
    
    try:
        # Route requests based on path and method
        if path == '/api/test' and http_method == 'GET':
            return handle_test(cors_headers)
        elif path == '/api/finalize-cost' and http_method == 'POST':
            return handle_finalize_cost(event, cors_headers)
        elif path == '/api/add' and http_method == 'POST':
            return handle_add_entry(event, cors_headers)
        elif path == '/api/summary' and http_method == 'GET':
            return handle_get_summary(cors_headers)
        elif path == '/api/config' and http_method == 'GET':
            return handle_get_config(cors_headers)
        elif path == '/api/find-approver' and http_method == 'POST':
            return handle_find_approver(event, cors_headers)
        elif path == '/api/debug-config' and http_method == 'GET':
            return handle_debug_config(cors_headers)
        elif path == '/api/debug-input' and http_method == 'POST':
            return handle_debug_input(event, cors_headers)
        else:
            return {
                'statusCode': 404,
                'headers': cors_headers,
                'body': json.dumps({'error': 'Endpoint not found', 'path': path})
            }
            
    except Exception as e:
        print(f"❌ ERROR in lambda_handler: {str(e)}")
        import traceback
        traceback.print_exc()
        return {
            'statusCode': 500,
            'headers': cors_headers,
            'body': json.dumps({
                'success': False,
                'error': f'Server error: {str(e)}'
            })
        }

def handle_test(cors_headers):
    """Handle /api/test endpoint"""
    return {
        'statusCode': 200,
        'headers': {**cors_headers, 'Content-Type': 'application/json'},
        'body': json.dumps({
            'success': True,
            'message': 'Backend is working!',
            'timestamp': datetime.now().isoformat(),
            'environment': 'AWS Lambda'
        })
    }

def handle_finalize_cost(event, cors_headers):
    """Handle /api/finalize-cost endpoint"""
    try:
        # Parse request body
        body = event.get('body', '{}')
        if isinstance(body, str):
            body = json.loads(body)
        
        print(f"🔍 DEBUG finalize-cost: Request data received: {body}")
        
        results_data = body.get('results', {})
        
        if not results_data:
            return {
                'statusCode': 400,
                'headers': {**cors_headers, 'Content-Type': 'application/json'},
                'body': json.dumps({
                    'success': False, 
                    'error': 'No data available for cost calculation. Please add some namespaces first.'
                })
            }
        
        print(f"🔍 DEBUG: Processing {len(results_data) if isinstance(results_data, list) else 'dict'} entries")
        
        # Import here to avoid circular imports
        from utils.calculator import calculate_final_cost
        finalized_costs = calculate_final_cost(results_data)
        
        # Calculate totals - FIXED: Use raw_monthly from each environment
        total_monthly = sum(env_data["raw_monthly"] for env_data in finalized_costs.values())
        # FIXED: Calculate annual as monthly × 12 to match Flask behavior
        total_annual = total_monthly * 12
        
        print(f"🔍 DEBUG: Final totals - Monthly: ${total_monthly}, Annual: ${total_annual}")
        
        return {
            'statusCode': 200,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({
                'success': True,
                'finalized_costs': finalized_costs,
                'total_monthly_cost': f"${total_monthly:,.2f}",
                'total_annual_cost': f"${total_annual:,.2f}",
                'raw_total_monthly': total_monthly,
                'raw_total_annual': total_annual
            })
        }
    except Exception as e:
        print(f"❌ ERROR in handle_finalize_cost: {str(e)}")
        import traceback
        traceback.print_exc()
        return {
            'statusCode': 500,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({
                'success': False,
                'error': f'Calculation error: {str(e)}'
            })
        }

def handle_add_entry(event, cors_headers):
    """Handle /api/add endpoint"""
    try:
        body = event.get('body', '{}')
        if isinstance(body, str):
            body = json.loads(body)
        
        if not body:
            return {
                'statusCode': 400,
                'headers': {**cors_headers, 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'No data provided'})
            }

        env = body.get("env")
        # CORRECT: Use CPU values that match Flask backend (6 nonprod, 128 prod)
        cpu_core_ns = 128 if env == "prod" else 6

        # CORRECT: Use Tier1 as default provisioner
        new_entry = {
            **body, 
            "cpu_core_ns": cpu_core_ns,
            "cluster_name": body.get("cluster_name", ""),
            "provisioner": body.get("provisioner", "Tier1"),
            "pdb": body.get("pdb", "minUnavailable = 1"),
            "eks_version": body.get("eks_version", "v1.32")
        }

        # In Lambda, we don't have sessions, so we'll return the entry
        # Frontend will need to manage state
        return {
            'statusCode': 200,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({
                'success': True, 
                'entry': new_entry,
                'message': 'Entry added successfully (frontend should manage state)'
            })
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({
                'success': False,
                'error': f'Error adding entry: {str(e)}'
            })
        }

def handle_get_summary(cors_headers):
    """Handle /api/summary endpoint"""
    # Since we don't have sessions in Lambda, return empty summary
    # Frontend should manage its own state
    return {
        'statusCode': 200,
        'headers': {**cors_headers, 'Content-Type': 'application/json'},
        'body': json.dumps({
            'message': 'State management should be handled by frontend in Lambda environment',
            'note': 'Use /api/finalize-cost for calculations with frontend-managed state'
        })
    }

def handle_get_config(cors_headers):
    """Handle /api/config endpoint - return all configurations"""
    try:
        from utils.config_loader import config_loader
        
        return {
            'statusCode': 200,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({
                'success': True,
                'configs': {
                    'calculatorDefaults': config_loader.get_calculator_defaults(),
                    'costMap': config_loader.get_cost_map(),
                    'defaults': config_loader.get_defaults(),
                    'orgMapping': config_loader.get_org_mapping()
                },
                'config_summary': {
                    "calculatorDefaults_loaded": bool(config_loader.get_calculator_defaults()),
                    "costMap_loaded": bool(config_loader.get_cost_map()),
                    "defaults_loaded": bool(config_loader.get_defaults()),
                    "orgMapping_loaded": bool(config_loader.get_org_mapping()),
                    "available_provisioners": list(config_loader.get_cost_map().keys()),
                    "available_environments": list(config_loader.get_defaults().keys())
                }
            })
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({
                'success': False,
                'error': f'Error loading config: {str(e)}'
            })
        }

def handle_find_approver(event, cors_headers):
    """Handle /api/find-approver endpoint"""
    try:
        from utils.config_loader import config_loader
        
        body = event.get('body', '{}')
        if isinstance(body, str):
            body = json.loads(body)
        
        tribe_name = body.get('tribe', '')
        if not tribe_name:
            return {
                'statusCode': 400,
                'headers': {**cors_headers, 'Content-Type': 'application/json'},
                'body': json.dumps({
                    'success': False,
                    'error': 'Tribe name is required'
                })
            }
        
        approver = config_loader.find_approver(tribe_name)
        
        return {
            'statusCode': 200,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({
                'success': True,
                'tribe': tribe_name,
                'approver': approver
            })
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({
                'success': False,
                'error': f'Error finding approver: {str(e)}'
            })
        }

def handle_debug_config(cors_headers):
    """Debug endpoint to check config loading"""
    try:
        from utils.config_loader import config_loader
        from utils.calculator import get_config_summary
        
        return {
            'statusCode': 200,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({
                'success': True,
                'config_summary': get_config_summary(),
                'loaded_configs': list(config_loader.configs.keys())
            })
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({
                'success': False,
                'error': f'Debug error: {str(e)}'
            })
        }

def handle_debug_input(event, cors_headers):
    """Debug endpoint to see what data is received"""
    try:
        body = event.get('body', '{}')
        if isinstance(body, str):
            body = json.loads(body)
        
        print("🔍 DEBUG Input data:", body)
        
        results_data = body.get('results', [])
        print(f"🔍 DEBUG: Received {len(results_data)} entries")
        
        for i, entry in enumerate(results_data):
            print(f"🔍 DEBUG Entry {i}:")
            print(f"  - env: {entry.get('env')}")
            print(f"  - monthlyCost: {entry.get('monthlyCost')}")
            print(f"  - annualCost: {entry.get('annualCost')}")
            print(f"  - provisioner: {entry.get('provisioner')}")
            print(f"  - cluster: {entry.get('cluster')}")
            print(f"  - tribe: {entry.get('tribe')}")
            print(f"  - cpu_core_ns: {entry.get('cpu_core_ns')}")
        
        return {
            'statusCode': 200,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({
                'success': True,
                'received_data': body,
                'entries_count': len(results_data),
                'message': 'Check backend logs for debug info'
            })
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({
                'success': False,
                'error': f'Debug error: {str(e)}'
            })
        }