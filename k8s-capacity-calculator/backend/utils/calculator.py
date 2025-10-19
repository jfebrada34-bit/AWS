import math

def calculate_final_cost(results):
    """
    Calculate finalized cost based on the actual user inputs
    FIXED: Uses correct CPU values (6 nonprod, 128 prod) to match Flask backend
    """
    print(f"🔍 DEBUG calculate_final_cost: Input results type: {type(results)}")
    print(f"🔍 DEBUG calculate_final_cost: Input results: {results}")
    
    # Import here to avoid circular imports
    from .config_loader import config_loader
    
    finalized_results = {}
    
    # Handle both list format (from frontend) and dict format (from session)
    if isinstance(results, list):
        # Convert list to environment-grouped dict
        env_groups = {}
        for entry in results:
            env = entry.get("env", "default")
            if env not in env_groups:
                env_groups[env] = []
            env_groups[env].append(entry)
        results = env_groups
        print(f"🔍 DEBUG: Converted list to environment groups: {env_groups}")
    
    for env, env_entries in results.items():
        print(f"🔍 DEBUG: Processing environment: {env} with {len(env_entries)} entries")
        
        namespace_count = len(env_entries)
        
        # FIXED: Use the ACTUAL monthlyCost and annualCost from frontend calculations
        total_monthly_cost = 0
        total_annual_cost = 0
        
        for entry in env_entries:
            # Use actual costs calculated by frontend
            monthly_cost = entry.get("monthlyCost", 0)
            annual_cost = entry.get("annualCost", 0)
            
            total_monthly_cost += monthly_cost
            total_annual_cost += annual_cost
            
            print(f"🔍 DEBUG: Namespace - Monthly: ${monthly_cost}, Annual: ${annual_cost}")
        
        print(f"🔍 DEBUG: Environment {env} - Total Monthly: ${total_monthly_cost}, Total Annual: ${total_annual_cost}")
        
        # FIXED: Use CORRECT CPU values that match Flask backend (6 nonprod, 128 prod)
        if env == "prod":
            cpu_per_namespace = 128  # 128 cores for production (matches Flask)
        else:
            cpu_per_namespace = 6    # 6 cores for non-prod (matches Flask)
        
        # Calculate total CPU based on namespace count and environment limits
        total_cpu_cores = namespace_count * cpu_per_namespace
        
        print(f"🔍 DEBUG: Environment {env} - CPU per namespace: {cpu_per_namespace} cores, Total CPU: {total_cpu_cores} cores")
        
        # Apply 30% buffer
        total_cpu_buffered_cores = math.ceil(total_cpu_cores * 1.3)
        
        print(f"🔍 DEBUG: CPU with 30% buffer: {total_cpu_buffered_cores} cores")
        
        # FIXED: Node count calculation that matches Flask backend exactly
        if env == "prod":
            # Production: 128 cores ÷ 56 nodes = ~2.29 cores per node
            node_count = math.ceil(total_cpu_buffered_cores / 2.29)
        else:
            # Non-prod: 6 cores ÷ 3 nodes = 2 cores per node
            node_count = math.ceil(total_cpu_buffered_cores / 2)
        
        print(f"🔍 DEBUG: Node count: {node_count}")
        
        # Get provisioner cost FROM USER INPUT
        provisioner = env_entries[0].get("provisioner", "Tier1") if env_entries else "Tier1"
        
        # Get PDB and EKS version FROM USER INPUTS
        pdb_value = env_entries[0].get("pdb", "minUnavailable = 1") if env_entries else "minUnavailable = 1"
        eks_version = env_entries[0].get("eks_version", "v1.32") if env_entries else "v1.32"
        cluster_name = env_entries[0].get("cluster", "Unknown Cluster") if env_entries else "Unknown Cluster"
        
        # Get tribe and find approver from orgMapping
        tribe_name = env_entries[0].get("tribe", "") if env_entries else ""
        approver = config_loader.find_approver(tribe_name) if tribe_name else "Unknown"
        
        # FIXED: Display CPU as numbers (cores) instead of millicores
        finalized_results[env] = {
            "cluster_name": cluster_name,
            "provisioner": provisioner,
            "pdb": pdb_value,
            "eks_version": eks_version,
            "namespace_count": namespace_count,
            "total_cpu": f"{total_cpu_cores}",  # Just the number, no "m"
            "total_cpu_buffered": f"{total_cpu_buffered_cores}",  # Just the number, no "m"
            "node_count": node_count,
            "monthly_cost": f"${total_monthly_cost:,.2f}",
            "annual_cost": f"${total_annual_cost:,.2f}",
            "raw_monthly": total_monthly_cost,
            "raw_annual": total_annual_cost,
            "tribe_approver": approver
        }
    
    print(f"🔍 DEBUG: Finalized results: {finalized_results}")
    return finalized_results