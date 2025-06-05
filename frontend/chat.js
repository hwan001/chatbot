const messagesDiv = document.getElementById('messages');
const userInput = document.getElementById('userInput');

async function sendMessage() {
    const text = userInput.value.trim();
    if (!text) return;

    messagesDiv.innerHTML += `<div class="message user"><span>🙋‍♂️ 사용자:</span> ${text}</div>`;

    // botReplySpan을 직접 참조
    const replyDiv = document.createElement("div");
    replyDiv.className = "message bot";
    const botReplySpan = document.createElement("span");
    replyDiv.innerHTML = `<span>🤖 챗봇:</span> `;
    replyDiv.appendChild(botReplySpan);
    messagesDiv.appendChild(replyDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;

    const res = await fetch('http://chatbot.avgmax.in:8080/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: "mistral",
            stream: true,
            max_tokens: 200,
            messages: [
                { role: "system", content: "너는 쇼핑몰 고객 상담을 도와주는 한국어 챗봇이야." },
                { role: "user", content: text }
            ]
        })
    });

    const reader = res.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let result = "";

    while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim().startsWith("data: "));
        for (const line of lines) {
            const data = line.replace("data: ", "").trim();
            if (data === "[DONE]") break;

            try {
                const json = JSON.parse(data);
                const delta = json.choices?.[0]?.delta?.content || "";
                result += delta;
                botReplySpan.textContent = result;  // ← 여기 중요
                messagesDiv.scrollTop = messagesDiv.scrollHeight;
            } catch (e) {
                console.warn("Stream JSON parse error:", e, line);
            }
        }
    }

    userInput.value = "";
}


userInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});


document.getElementById("sendButton").addEventListener("click", sendMessage);
