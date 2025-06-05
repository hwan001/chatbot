curl http://localhost:8080/v1/chat/completions \
  -H "Content-Type: application/json; charset=utf-8" \
  -d '{
    "model": "mistral",
    "stream": false,
    "messages": [
      { "role": "system", "content": "You are a helpful assistant." },
      { "role": "user", "content": "Say hello in Korean." }
    ]
  }'
