#!/usr/bin/env bash

# test-all-apis.sh
# A script to verify that all Grad360 MBA application API endpoints are returning basic expected responses.

BASE_URL="http://localhost:3000/api"
TIMEOUT=10
FAILED=0
PASSED=0

echo "================================================="
echo "   Grad360 API Verification Script"
echo "   Target: $BASE_URL"
echo "================================================="

# Helper function
check_endpoint() {
    local method=$1
    local endpoint=$2
    local expected_status=$3
    local description=$4

    echo -n "Testing [$method] $endpoint ($description)... "
    
    # Use curl to get both HTTP status and response body
    local response=$(curl -s -w "\n%{http_code}" -X "$method" --max-time $TIMEOUT "$BASE_URL$endpoint")
    local status_code=$(echo "$response" | tail -n1)
    
    if [ "$status_code" == "$expected_status" ] || ([ "$expected_status" == "200|401" ] && ([ "$status_code" == "200" ] || [ "$status_code" == "401" ])); then
        echo "✅ PASSED ($status_code)"
        ((PASSED++))
    else
        echo "❌ FAILED (Expected $expected_status, got $status_code)"
        ((FAILED++))
    fi
}

echo ""
echo "--- Core Endpoints ---"
check_endpoint "GET" "/health" "200" "System Health Check"

echo ""
echo "--- Auth Endpoints (Expecting 401 Unauthorized without JWT) ---"
check_endpoint "GET" "/student/insights" "401" "Student specific insights"
check_endpoint "GET" "/student/pri-test" "401" "Student PRI tests"
check_endpoint "GET" "/student/psychometric" "401" "Student Psychometric tests"
check_endpoint "GET" "/admin/questions" "401" "Admin get questions"

echo ""
echo "--- Consolidated AI Services Endpoints (Expecting 401 or valid response) ---"
# Note: AI Services now integrated into Main Next.js App
check_endpoint "GET" "/insights/invalid-student-id" "401" "Student Insight Generation"
check_endpoint "GET" "/faculty/insights" "401" "Faculty Batch Insights"

echo ""
echo "================================================="
echo "Results: $PASSED Passed | $FAILED Failed"

if [ $FAILED -gt 0 ]; then
    echo "Summary: Some endpoints failed. Make sure the server is running on port 3000."
    exit 1
else
    echo "Summary: All tests passed successfully!"
    exit 0
fi
