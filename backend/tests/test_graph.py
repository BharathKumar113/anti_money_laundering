def test_graph_network_and_cycle_detection(client):
    # Ingest circular laundering flow: A -> B -> C -> A
    ring_txs = [
        {
            "step": 1,
            "type": "TRANSFER",
            "amount": 75000.0,
            "name_orig": "C_TEST_NODE_A",
            "old_balance_orig": 100000.0,
            "new_balance_orig": 25000.0,
            "name_dest": "C_TEST_NODE_B",
            "old_balance_dest": 0.0,
            "new_balance_dest": 75000.0,
        },
        {
            "step": 1,
            "type": "TRANSFER",
            "amount": 74000.0,
            "name_orig": "C_TEST_NODE_B",
            "old_balance_orig": 75000.0,
            "new_balance_orig": 1000.0,
            "name_dest": "C_TEST_NODE_C",
            "old_balance_dest": 500.0,
            "new_balance_dest": 74500.0,
        },
        {
            "step": 2,
            "type": "TRANSFER",
            "amount": 73000.0,
            "name_orig": "C_TEST_NODE_C",
            "old_balance_orig": 74500.0,
            "new_balance_orig": 1500.0,
            "name_dest": "C_TEST_NODE_A",
            "old_balance_dest": 25000.0,
            "new_balance_dest": 98000.0,
        },
    ]

    for tx in ring_txs:
        resp = client.post("/api/v1/transactions/", json=tx)
        assert resp.status_code == 201

    # 1. Fetch account subgraph for node A
    graph_resp = client.get("/api/v1/graph/account/C_TEST_NODE_A?hops=2")
    assert graph_resp.status_code == 200
    graph_data = graph_resp.json()
    assert graph_data["total_nodes"] >= 3
    assert graph_data["total_edges"] >= 3
    node_ids = [n["id"] for n in graph_data["nodes"]]
    assert "C_TEST_NODE_A" in node_ids
    assert "C_TEST_NODE_B" in node_ids
    assert "C_TEST_NODE_C" in node_ids

    # 2. Detect global cycles
    cycles_resp = client.get("/api/v1/graph/cycles")
    assert cycles_resp.status_code == 200
    cycles = cycles_resp.json()
    assert len(cycles) >= 1
    # Check that the cycle contains our accounts
    assert any("C_TEST_NODE_A" in c["accounts"] for c in cycles)
