import { escapeHTML } from './chat/chatUtils.js';

// Funções de UI
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

// Funções de ação
let abortController = null;

export async function enviarMensagem(mensagem, input, chatContainer, sendBtn, stopBtn) {
    if (!mensagem.trim()) return;

    input.value = '';
    input.style.height = 'auto';
    
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
                conversation_id: window.conversaAtual?.id
            }),
            signal: abortController.signal
        });

        if (!response.ok) {
            throw new Error('Erro na resposta do servidor');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');

        while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    try {
                        const jsonData = JSON.parse(line.slice(6));
                        if (jsonData.content) {
                            accumulatedMessage += jsonData.content;
                            loadingDiv.innerHTML = `<p>${accumulatedMessage.replace(/\n/g, '<br>')}</p>`;
                            chatContainer.scrollTop = chatContainer.scrollHeight;
                        }
                    } catch (e) {
                        console.error('Erro ao processar chunk:', e);
                    }
                }
            }
        }

        loadingDiv.remove();
        adicionarMensagem(chatContainer, accumulatedMessage, 'assistant');
        adicionarMensagemAoHistorico(accumulatedMessage, 'assistant');
        
    } catch (erro) {
        if (erro.name === 'AbortError') {
            console.log('Geração de resposta interrompida pelo usuário');
            adicionarMensagem(chatContainer, accumulatedMessage, 'assistant');
            adicionarMensagemAoHistorico(accumulatedMessage, 'assistant');
        } else {
            console.error('Erro:', erro);
            const mensagemErro = 'Erro ao conectar com o servidor. Por favor, tente novamente.';
            adicionarMensagem(chatContainer, mensagemErro, 'assistant');
            adicionarMensagemAoHistorico(mensagemErro, 'assistant');
        }
    } finally {
        sendBtn.style.display = 'inline';
        stopBtn.style.display = 'none';
        abortController = null;
    }
}

export function interromperResposta() {
    if (abortController) {
        abortController.abort();
    }
}

function mostrarCarregamento(chatContainer) {
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

// Funções de armazenamento
export function carregarConversa(id) {
    const conversa = window.conversas.find(c => c.id === id);
    if (!conversa) return;

    window.conversaAtual = conversa;
    const chatContainer = document.querySelector('.chat-container');
    const welcomeScreen = document.querySelector('.welcome-screen');
    const inputContainer = document.querySelector('.input-container');
    
    welcomeScreen.style.display = 'none';
    chatContainer.style.display = 'block';
    inputContainer.style.display = 'block';
    chatContainer.innerHTML = '';
    
    conversa.mensagens.forEach(msg => {
        adicionarMensagem(chatContainer, msg.conteudo, msg.tipo);
    });
}

export function atualizarListaConversas() {
    const chatList = document.querySelector('.chat-list');
    if (!chatList) return;

    chatList.innerHTML = '';
    window.conversas.forEach(conversa => {
        const conversaElement = document.createElement('div');
        conversaElement.className = 'chat-item';
        if (window.conversaAtual && window.conversaAtual.id === conversa.id) {
            conversaElement.classList.add('active');
        }
        
        conversaElement.onclick = () => carregarConversa(conversa.id);
        
        const primeiraMsg = conversa.mensagens.find(m => m.tipo === 'user')?.conteudo || 'Nova conversa';
        const titulo = conversa.titulo || primeiraMsg.substring(0, 30) + (primeiraMsg.length > 30 ? '...' : '');
        
        conversaElement.innerHTML = `
            <span>${titulo}</span>
            <div class="action-buttons">
                <button class="action-btn" onclick="event.stopPropagation(); window.renomearConversa('${conversa.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn" onclick="event.stopPropagation(); window.excluirConversa('${conversa.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        chatList.appendChild(conversaElement);
    });

    // Configurar pesquisa
    const searchInput = document.querySelector('#search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const chatItems = chatList.querySelectorAll('.chat-item');
            
            chatItems.forEach(item => {
                const titulo = item.querySelector('span').textContent.toLowerCase();
                if (titulo.includes(searchTerm)) {
                    item.style.display = 'flex';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    }
}

export function criarNovaConversa() {
    const novaConversa = {
        id: Date.now().toString(),
        titulo: 'Nova conversa',
        mensagens: []
    };
    
    window.conversas.unshift(novaConversa);
    window.conversaAtual = null;
    atualizarListaConversas();
}

export function adicionarMensagemAoHistorico(mensagem, tipo) {
    if (!window.conversaAtual) {
        const novaConversa = {
            id: Date.now().toString(),
            titulo: 'Nova conversa',
            mensagens: []
        };
        window.conversas.unshift(novaConversa);
        window.conversaAtual = novaConversa;
    }
    
    window.conversaAtual.mensagens.push({
        tipo,
        conteudo: mensagem,
        timestamp: new Date().toISOString()
    });
    
    atualizarListaConversas();
}

export function renomearConversa(id) {
    const conversa = window.conversas.find(c => c.id === id);
    if (!conversa) return;

    const novoTitulo = prompt('Digite o novo título da conversa:', conversa.titulo);
    if (novoTitulo && novoTitulo.trim()) {
        conversa.titulo = novoTitulo.trim();
        atualizarListaConversas();
    }
}

export function excluirConversa(id) {
    if (!confirm('Tem certeza que deseja excluir esta conversa?')) return;
    
    window.conversas = window.conversas.filter(c => c.id !== id);
    
    if (window.conversaAtual && window.conversaAtual.id === id) {
        window.conversaAtual = null;
        const welcomeScreen = document.querySelector('.welcome-screen');
        const chatContainer = document.querySelector('.chat-container');
        const inputContainer = document.querySelector('.input-container');
        
        welcomeScreen.style.display = 'flex';
        chatContainer.style.display = 'none';
        inputContainer.style.display = 'none';
        
        document.querySelector('#welcome-input').value = '';
        document.querySelector('#chat-input').value = '';
    }
    
    atualizarListaConversas();
}