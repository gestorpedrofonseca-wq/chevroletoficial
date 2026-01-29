document.addEventListener('DOMContentLoaded', () => {
    const startScreen = document.getElementById('start-screen');
    const btnStart = document.getElementById('btn-start');
    const btnSkip = document.getElementById('btn-skip');
    const incomingScreen = document.getElementById('incoming-screen');
    const activeScreen = document.getElementById('active-screen');
    const btnAnswer = document.getElementById('btn-answer');
    const btnEnd = document.getElementById('btn-end');
    const humanBtn = document.getElementById('human-btn');
    const redirectMsg = document.getElementById('redirect-message');
    const callAudio = document.getElementById('call-audio');
    const ringingAudio = document.getElementById('ringing-audio');
    const timerElement = document.getElementById('call-timer');
    const toast = document.getElementById('toast');
    
    // Configuração do Áudio de Vibração
    const somVibrar = new Audio('./assets/audio/Som de Celular Vibrando - Efeitos Sonoros HD - Sons e Efeitos - Efeitos Sonoros FX (youtube).mp3');

    // WhatsApp Configuration
    const whatsappNumber = '5551992856577';
    const whatsappMessage = encodeURIComponent('Olá, Gostaria de ver as condições especiais.');
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

    let checkInterval;
    let seconds = 0;
    let autoAnswerTimeout;
    let isAnswered = false;
    let isStarted = false;
    let toastTimeout;

    // --- Audio Functions ---
    function playRinging() {
        // Inicia a vibração imediatamente
        somVibrar.play().catch(e => console.log("Vibração aguardando interação"));
        
        // Para a vibração após 4 segundos
        setTimeout(() => {
            somVibrar.pause();
            somVibrar.currentTime = 0;
        }, 4000);

        ringingAudio.load();
        ringingAudio.currentTime = 0;
        setTimeout(() => {
            ringingAudio.play().catch(e => {
                console.log("Autoplay blocked, waiting for interaction");
                document.body.addEventListener('click', () => {
                    if (!isAnswered) {
                        ringingAudio.play();
                        // Tenta tocar a vibração no clique caso tenha sido bloqueada
                        somVibrar.play(); 
                        setTimeout(() => { somVibrar.pause(); }, 4000);
                    }
                }, { once: true });
            });
        }, 1000);
    }

    // --- Call Handling ---
    function answerCall() {
        if (isAnswered) return;
        isAnswered = true;

        clearTimeout(autoAnswerTimeout);
        
        // Garante que a vibração pare se atenderem antes dos 4s
        somVibrar.pause(); 
        ringingAudio.pause();
        ringingAudio.currentTime = 0;

        incomingScreen.classList.remove('active');

        setTimeout(() => {
            activeScreen.classList.add('active');
            callAudio.load(); 
            callAudio.play().catch(e => {
                console.error("Audio play failed", e);
                document.body.addEventListener('click', () => {
                    callAudio.play();
                }, { once: true });
            });
            startTimer();
        }, 500);
    }

    function startAtendimento() {
        if (isStarted) return;
        isStarted = true;

        // Reseta estado (caso o usuário recarregue/volte e clique de novo)
        clearInterval(checkInterval);
        clearTimeout(autoAnswerTimeout);
        seconds = 0;
        isAnswered = false;
        timerElement.textContent = '00:00';

        // Troca telas
        startScreen.classList.remove('active');
        incomingScreen.classList.add('active');

        // Inicia os sons APÓS interação do usuário (evita bloqueio de autoplay)
        playRinging();

        // Auto-answer after 3 seconds (+1s de delay inicial = 4s total)
        autoAnswerTimeout = setTimeout(() => {
            if (!isAnswered) {
                answerCall();
            }
        }, 4000);
    }

    // ... Restante do seu código (startTimer, redirectToWhatsapp, Listeners, etc) permanece igual
    function startTimer() {
        checkInterval = setInterval(() => {
            seconds++;
            const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
            const secs = (seconds % 60).toString().padStart(2, '0');
            timerElement.textContent = `${mins}:${secs}`;

            if (seconds === 32) {
                humanBtn.style.display = 'block';
            }
        }, 1000);
    }

    function redirectToWhatsapp() {
        redirectMsg.style.display = 'block';
        setTimeout(() => {
            window.location.href = whatsappUrl;
        }, 1500);
    }

    function showToast() {
        clearTimeout(toastTimeout);
        toast.classList.add('show');
        toastTimeout = setTimeout(() => {
            toast.classList.remove('show');
        }, 2000);
    }

    // Se a tela/botão inicial não existirem por algum motivo, mantém o comportamento antigo.
    if (btnStart && startScreen) {
        btnStart.addEventListener('click', startAtendimento);
        btnStart.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') startAtendimento();
        });
        if (btnSkip) {
            btnSkip.addEventListener('click', startAtendimento);
            btnSkip.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') startAtendimento();
            });
        }
    } else {
        playRinging();
        autoAnswerTimeout = setTimeout(() => {
            if (!isAnswered) {
                answerCall();
            }
        }, 4000);
    }
    btnAnswer.addEventListener('click', answerCall);

    let startY = 0;
    const swipeThreshold = 50;
    const handleStart = (e) => {
        startY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
    };
    const handleMove = (e) => {
        if (isAnswered) return;
        const currentY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
        const diff = startY - currentY;
        if (diff > swipeThreshold) {
            answerCall();
        }
    };
    btnAnswer.addEventListener('touchstart', handleStart);
    btnAnswer.addEventListener('touchmove', handleMove);
    btnAnswer.addEventListener('mousedown', handleStart);
    window.addEventListener('mousemove', (e) => {
        if (startY > 0) handleMove(e);
    });
    window.addEventListener('mouseup', () => {
        startY = 0;
    });

    humanBtn.addEventListener('click', () => {
        callAudio.pause();
        redirectToWhatsapp();
    });

    btnEnd.addEventListener('click', () => {
        clearInterval(checkInterval);
        showToast();
    });

    document.querySelectorAll('.control-item').forEach(btn => {
        btn.addEventListener('click', showToast);
    });

    callAudio.addEventListener('ended', () => {
        redirectToWhatsapp();
    });
});
