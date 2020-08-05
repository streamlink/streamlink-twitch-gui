#!/usr/bin/env bash
[[ "${CI}" ]] || exit 1

HOST="https://api.github.com"
HEADERS=(
  -H "Accept: application/vnd.github.v3+json"
  -H "User-Agent: ${GITHUB_REPOSITORY}"
)
URL="${HOST}/repos/${GITHUB_REPOSITORY}/actions/runs?branch=${GITHUB_REF#refs/heads/}&event=${GITHUB_EVENT_NAME}&status=success&per_page=1"
SELECT=".workflow_runs[].head_sha | select(. == \"${GITHUB_SHA}\")"

success() {
  echo "$@"
  exit 0
}

cancel() {
  echo "$@"
  curl -sSL \
    -X POST \
    "${HEADERS[@]}" \
    -H "Authorization: token ${GITHUB_TOKEN}" \
    "${HOST}/repos/${GITHUB_REPOSITORY}/actions/runs/${GITHUB_RUN_ID}/cancel"
  sleep 60
  exit 1
}

MAX=5
SLEEP=5
for n in $(seq 1 ${MAX}); do
  echo "Checking GitHub API for previous run... (${n}/${MAX})"
  data="$(curl -sSL "${HEADERS[@]}" "${URL}")"
  [[ $? > 0 ]] && sleep "${SLEEP}" && continue
  if jq -re "${SELECT}" <<< "${data}" >/dev/null 2>/dev/null; then
    cancel "Previous run found, aborting..."
  else
    success "Previous run not found, continuing..."
  fi
done

cancel "Could not query GitHub API, aborting..."
