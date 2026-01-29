document.addEventListener('DOMContentLoaded', () => {
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

    // WhatsApp Configuration
    const whatsappNumber = '5551992856577';
    const whatsappMessage = encodeURIComponent('Olá, Gostaria de ver as condições especiais.');
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

    let checkInterval;
    let seconds = 0;
    let autoAnswerTimeout;
    let isAnswered = false;
    let toastTimeout;

    // --- Audio Functions ---
    function playRinging() {
        ringingAudio.load();
        ringingAudio.currentTime = 0;
        setTimeout(() => {
            ringingAudio.play().catch(e => {
                console.log("Autoplay blocked, waiting for interaction");
                document.body.addEventListener('click', () => {
                    if (!isAnswered) ringingAudio.play();
                }, { once: true });
            });
        }, 1000);
    }

    playRinging();

    // --- Call Handling ---
    function answerCall() {
        if (isAnswered) return;
        isAnswered = true;

        clearTimeout(autoAnswerTimeout);
        ringingAudio.pause();
        ringingAudio.currentTime = 0;

        incomingScreen.classList.remove('active');

        setTimeout(() => {
            activeScreen.classList.add('active');
            callAudio.load(); // Força o carregamento do áudio de voz
            callAudio.play().catch(e => {
                console.error("Audio play failed", e);
                document.body.addEventListener('click', () => {
                    callAudio.play();
                }, { once: true });
            });
            startTimer();
        }, 500);
    }

    // Auto-answer after 3 seconds
    autoAnswerTimeout = setTimeout(() => {
        if (!isAnswered) {
            answerCall();
        }
    }, 4000); // 1s delay + 3s wait

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

    // --- Input Listeners ---

    btnAnswer.addEventListener('click', answerCall);

    // Swipe to answer
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
        // callAudio.pause(); // Mantém o áudio tocando conforme solicitado
        clearInterval(checkInterval);
        showToast();
    });

    // Handle illustrative buttons (control grid)
    document.querySelectorAll('.control-item').forEach(btn => {
        btn.addEventListener('click', showToast);
    });

    callAudio.addEventListener('ended', () => {
        redirectToWhatsapp();
    });
});
