// Estado do chat
let conversas = [];
let conversaAtual = null;
let abortController = null;

export function iniciarChat(welcomeScreen, chatContainer, inputContainer) {
    welcomeScreen.style.display = 'none';
    chatContainer.style.display = 'block';
    inputContainer.style.display = 'block';
    chatContainer.innerHTML = '';
}

export function mostrarTelaInicial(welcomeScreen, chatContainer, inputContainer, welcomeInput, chatInput) {
    welcomeScreen.style.display = 'flex';
    chatContainer.style.display = 'none';
    inputContainer.style.display = 'none';
    welcomeInput.value = '';
    chatInput.value = '';
    conversaAtual = null;
    atualizarListaConversas(document.querySelector('.chat-list'));
}

export function escapeHTML(text) {
    const div = document.createElement('div');
    div.innerText = text;
    return div.innerHTML;
}

export function adicionarMensagem(chatContainer, texto, tipo) {
    const mensagemDiv = document.createElement('div');
    mensagemDiv.className = `message ${tipo}`;
    mensagemDiv.innerHTML = `
        <p>${escapeHTML(texto).replace(/\n/g, '<br>')}</p>
        <div class="message-actions">
            <button class="action-btn" onclick="copiarMensagem(this)">
                <i class="fas fa-copy"></i>
            </button>
            ${tipo === 'assistant' ? `
                <button class="action-btn" onclick="regenerarResposta(this)">
                    <i class="fas fa-redo"></i>
                </button>
            ` : ''}
        </div>
    `;
    chatContainer.appendChild(mensagemDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

export function mostrarCarregamento(chatContainer) {
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'loading message assistant';
    loadingDiv.innerHTML = `
        <span></span>
        <span></span>
        <span></span>
    `;
    chatContainer.appendChild(loadingDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    return loadingDiv;
}

export async function enviarMensagem(mensagem, input, chatContainer, sendBtn, stopBtn) {
    if (!mensagem.trim()) return;

    // Previne o comportamento padrão do formulário
    event.preventDefault();

    if (!conversaAtual) {
        iniciarChat(document.querySelector('.welcome-screen'), chatContainer, document.querySelector('.input-container'));
        conversaAtual = {
            id: Date.now().toString(),
            titulo: mensagem.slice(0, 30) + (mensagem.length > 30 ? '...' : ''),
            mensagens: []
        };
        conversas.push(conversaAtual);
    }

    input.value = '';
    input.style.height = 'auto';
    adicionarMensagem(chatContainer, mensagem, 'user');
    conversaAtual.mensagens.push({ tipo: 'user', conteudo: mensagem });

    const loadingDiv = mostrarCarregamento(chatContainer);
    let accumulatedMessage = '';

    sendBtn.style.display = 'none';
    stopBtn.style.display = 'inline';

    abortController = new AbortController();

    try {
        const response = await fetch('/send_message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: mensagem,
                conversation_id: conversaAtual.id
            }),
            signal: abortController.signal
        });

        if (response.ok && response.body) {
            const reader = response.body.getReader();
            const decoder = new TextDecoder('utf-8');
            let done = false;

            while (!done) {
                const { value, done: streamDone } = await reader.read();
                done = streamDone;
                if (value) {
                    const chunk = decoder.decode(value, { stream: true });
                    try {
                        if (chunk.includes('data: ')) {
                            const jsonString = chunk.split('data: ')[1].trim();
                            if (jsonString && jsonString !== '[DONE]') {
                                const json = JSON.parse(jsonString);
                                if (json.content) {
                                    accumulatedMessage += json.content;
                                    loadingDiv.innerHTML = `<p>${escapeHTML(accumulatedMessage).replace(/\n/g, '<br>')}</p>`;
                                }
                            }
                        }
                    } catch (e) {
                        console.error('[Debug] Erro ao processar chunk:', chunk, e);
                    }
                }
            }

            loadingDiv.remove();
            adicionarMensagem(chatContainer, accumulatedMessage, 'assistant');
            conversaAtual.mensagens.push({ tipo: 'assistant', conteudo: accumulatedMessage });
            atualizarListaConversas(document.querySelector('.chat-list'));
        } else {
            throw new Error('Resposta inválida do servidor');
        }
    } catch (erro) {
        if (erro.name === 'AbortError') {
            console.log('Geração de resposta interrompida pelo usuário.');
            adicionarMensagem(chatContainer, accumulatedMessage, 'assistant');
            conversaAtual.mensagens.push({ tipo: 'assistant', conteudo: accumulatedMessage });
        } else {
            const mensagemErro = 'Erro ao conectar com o servidor. Verifique se o servidor está rodando.';
            adicionarMensagem(chatContainer, mensagemErro, 'assistant');
            conversaAtual.mensagens.push({ tipo: 'assistant', conteudo: mensagemErro });
            console.error('Erro:', erro);
        }
    } finally {
        sendBtn.style.display = 'inline';
        stopBtn.style.display = 'none';
        abortController = null;
        atualizarListaConversas(document.querySelector('.chat-list'));
    }
}

export function interromperResposta() {
    if (abortController) {
        abortController.abort();
    }
}

export function carregarConversa(id) {
    const conversa = conversas.find(c => c.id === id);
    if (!conversa) return;

    conversaAtual = conversa;
    const chatContainer = document.querySelector('.chat-container');
    iniciarChat(document.querySelector('.welcome-screen'), chatContainer, document.querySelector('.input-container'));

    chatContainer.innerHTML = '';
    conversa.mensagens.forEach(msg => {
        adicionarMensagem(chatContainer, msg.conteudo, msg.tipo);
    });
}

export function atualizarListaConversas(chatList) {
    if (!chatList) return;
    
    chatList.innerHTML = '';
    conversas.forEach(conversa => {
        const conversaElement = document.createElement('div');
        conversaElement.className = 'chat-item';
        conversaElement.onclick = () => carregarConversa(conversa.id);
        conversaElement.innerHTML = `
            <span>${conversa.titulo}</span>
            <div class="action-buttons">
                <button class="action-btn" onclick="event.stopPropagation(); renomearConversa('${conversa.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn" onclick="event.stopPropagation(); excluirConversa('${conversa.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        chatList.appendChild(conversaElement);
    });
}

window.copiarMensagem = function(button) {
    const mensagem = button.closest('.message').querySelector('p').textContent.trim();
    navigator.clipboard.writeText(mensagem);
    
    const icon = button.querySelector('i');
    icon.className = 'fas fa-check';
    setTimeout(() => {
        icon.className = 'fas fa-copy';
    }, 1000);
}

window.regenerarResposta = function(button) {
    const mensagemElement = button.closest('.message');
    const mensagemAnterior = mensagemElement.previousElementSibling;
    if (mensagemAnterior && mensagemAnterior.classList.contains('user')) {
        const mensagemUsuario = mensagemAnterior.querySelector('p').textContent.trim();
        mensagemElement.remove();
        if (conversaAtual) {
            conversaAtual.mensagens.pop();
        }
        enviarMensagem(mensagemUsuario, document.querySelector('#chat-input'), document.querySelector('.chat-container'), document.querySelector('#send-btn'), document.querySelector('#stop-btn'));
    }
}

window.renomearConversa = function(id) {
    const conversa = conversas.find(c => c.id === id);
    if (!conversa) return;

    const novoTitulo = prompt('Digite o novo título da conversa:', conversa.titulo);
    if (novoTitulo && novoTitulo.trim()) {
        conversa.titulo = novoTitulo.trim();
        atualizarListaConversas(document.querySelector('.chat-list'));
    }
}

window.excluirConversa = function(id) {
    if (confirm('Tem certeza que deseja excluir esta conversa?')) {
        conversas = conversas.filter(c => c.id !== id);
        if (conversaAtual && conversaAtual.id === id) {
            mostrarTelaInicial(
                document.querySelector('.welcome-screen'),
                document.querySelector('.chat-container'),
                document.querySelector('.input-container'),
                document.querySelector('#welcome-input'),
                document.querySelector('#chat-input')
            );
        }
        atualizarListaConversas(document.querySelector('.chat-list'));
    }
}

// Adiciona event listener para o botão "Novo Chat"
document.querySelector('.new-chat-btn')?.addEventListener('click', () => {
    mostrarTelaInicial(
        document.querySelector('.welcome-screen'),
        document.querySelector('.chat-container'),
        document.querySelector('.input-container'),
        document.querySelector('#welcome-input'),
        document.querySelector('#chat-input')
    );
});