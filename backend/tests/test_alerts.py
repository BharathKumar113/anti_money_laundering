def test_alert_automatic_generation_and_triage(client):
    # 1. Ingest highly suspicious transaction
    tx_payload = {
        "step": 5,
        "type": "TRANSFER",
        "amount": 500000.00,
        "name_orig": "C_FRAUDSTER",
        "old_balance_orig": 500000.00,
        "new_balance_orig": 0.00,
        "name_dest": "C_MULE_ACC",
        "old_balance_dest": 0.0,
        "new_balance_dest": 500000.00,
    }
    tx_resp = client.post("/api/v1/transactions/", json=tx_payload)
    assert tx_resp.status_code == 201
    tx_id = tx_resp.json()["id"]

    # 2. Verify alert was automatically created
    alerts_resp = client.get("/api/v1/alerts/?status=PENDING")
    assert alerts_resp.status_code == 200
    alerts = alerts_resp.json()
    matching = [a for a in alerts if a["transaction_id"] == tx_id]
    assert len(matching) == 1
    alert_id = matching[0]["id"]
    assert matching[0]["status"] == "PENDING"
    assert matching[0]["severity"] in ("HIGH", "CRITICAL")

    # 3. Investigator triages alert -> marks CONFIRMED_FRAUD
    update_payload = {
        "status": "CONFIRMED_FRAUD",
        "investigator_notes": "Confirmed smurfing and money mule account routing.",
        "assigned_to": "officer_bharath",
    }
    patch_resp = client.patch(f"/api/v1/alerts/{alert_id}", json=update_payload)
    assert patch_resp.status_code == 200
    updated_alert = patch_resp.json()
    assert updated_alert["status"] == "CONFIRMED_FRAUD"
    assert updated_alert["assigned_to"] == "officer_bharath"
    assert updated_alert["resolved_at"] is not None
