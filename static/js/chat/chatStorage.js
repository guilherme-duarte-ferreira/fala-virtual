// Estado global do chat
window.conversas = [];
window.conversaAtual = null;

export function carregarConversa(id) {
    const conversa = window.conversas.find(c => c.id === id);
    if (!conversa) return;

    window.conversaAtual = conversa;
    const chatContainer = document.querySelector('.chat-container');
    
    // Importar funções necessárias
    import('./chatUI.js').then(({ iniciarChat, adicionarMensagem }) => {
        iniciarChat(document.querySelector('.welcome-screen'), chatContainer, document.querySelector('.input-container'));
        chatContainer.innerHTML = '';
        conversa.mensagens.forEach(msg => {
            adicionarMensagem(chatContainer, msg.conteudo, msg.tipo);
        });
    });
}

export function atualizarListaConversas(chatList) {
    chatList.innerHTML = '';
    window.conversas.forEach(conversa => {
        const conversaElement = document.createElement('div');
        conversaElement.className = 'chat-item';
        conversaElement.onclick = () => carregarConversa(conversa.id);
        conversaElement.innerHTML = `
            <span>${conversa.titulo}</span>
            <div class="action-buttons">
                <button class="action-btn" onclick="event.stopPropagation(); renomearConversa(${conversa.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn" onclick="event.stopPropagation(); excluirConversa(${conversa.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        chatList.appendChild(conversaElement);
    });
}

export function copiarMensagem(button) {
    const mensagem = button.closest('.message').textContent.trim();
    navigator.clipboard.writeText(mensagem);
    
    const icon = button.querySelector('i');
    icon.className = 'fas fa-check';
    setTimeout(() => {
        icon.className = 'fas fa-copy';
    }, 1000);
}

export function regenerarResposta(button) {
    const mensagemElement = button.closest('.message');
    const mensagemAnterior = mensagemElement.previousElementSibling;
    if (mensagemAnterior && mensagemAnterior.classList.contains('user')) {
        const mensagemUsuario = mensagemAnterior.textContent.trim();
        mensagemElement.remove();
        if (window.conversaAtual) {
            window.conversaAtual.mensagens.pop();
        }
        
        // Importar função necessária
        import('./chatActions.js').then(({ enviarMensagem }) => {
            enviarMensagem(
                mensagemUsuario,
                document.querySelector('#chat-input'),
                document.querySelector('.chat-container'),
                document.querySelector('#send-btn'),
                document.querySelector('#stop-btn')
            );
        });
    }
}

export function renomearConversa(id) {
    const conversa = window.conversas.find(c => c.id === id);
    if (!conversa) return;

    const novoTitulo = prompt('Digite o novo título da conversa:', conversa.titulo);
    if (novoTitulo && novoTitulo.trim()) {
        conversa.titulo = novoTitulo.trim();
        atualizarListaConversas(document.querySelector('.chat-list'));
    }
}

export function excluirConversa(id) {
    if (confirm('Tem certeza que deseja excluir esta conversa?')) {
        window.conversas = window.conversas.filter(c => c.id !== id);
        if (window.conversaAtual && window.conversaAtual.id === id) {
            // Importar função necessária
            import('./chatUI.js').then(({ mostrarTelaInicial }) => {
                mostrarTelaInicial(
                    document.querySelector('.welcome-screen'),
                    document.querySelector('.chat-container'),
                    document.querySelector('.input-container'),
                    document.querySelector('#welcome-input'),
                    document.querySelector('#chat-input')
                );
            });
        }
        atualizarListaConversas(document.querySelector('.chat-list'));
    }
}
