document.addEventListener("DOMContentLoaded", function () {
    const canvas = document.getElementById("animatedBackgroundCanvas");
    if (!canvas) {
        console.error("Animated background canvas not found!");
        return;
    }
    const ctx = canvas.getContext("2d");

    let animationFrameId;

    // Set canvas dimensions
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas(); // Initial size

    // --- RoonRun Character Animation ---
    const roonRunIdleFrames = [];
    const roonRunFrameCount = 4;
    let roonRunLoadedFrames = 0;
    let currentRoonRunFrame = 0;
    const roonRunAnimationSpeed = 150; // milliseconds per frame
    let lastRoonRunFrameTime = 0;
    const roonRunSprite = {
        x: 50,
        y: canvas.height - 100, // Position near bottom left
        width: 64,
        height: 64,
        dx: 0.5, // Horizontal speed for gentle floating/drifting
        direction: 1
    };

    for (let i = 0; i < roonRunFrameCount; i++) {
        const img = new Image();
        // Assuming assets are at the root, as per project spec
        img.src = `/roonrun_idle_f${i}.png`; 
        img.onload = () => {
            roonRunLoadedFrames++;
            if (roonRunLoadedFrames === roonRunFrameCount) {
                console.log("RoonRun idle frames loaded.");
                // Start animation loop only after all critical assets are loaded
                if (!animationFrameId) {
                    animate();
                }
            }
        };
        img.onerror = () => {
            console.error(`Failed to load RoonRun idle frame: /roonrun_idle_f${i}.png`);
        };
        roonRunIdleFrames.push(img);
    }

    // --- Math Elements Animation ---
    const mathElements = [];
    const numMathElements = 25; // Number of shapes/equations
    const mathSymbols = ["+", "-", "×", "÷", "=", "√", "π", "∞", "Σ", "∫", "Δ", "Ω", "μ", "θ"];
    const simpleEquations = ["1+1", "2×2", "√9", "a²", "b²", "c²", "E=mc²", "y=mx+b", "x/y"];
    const shapes = ["circle", "square", "triangle", "line"];

    function getRandomElement() {
        const typeChance = Math.random();
        if (typeChance < 0.4) return mathSymbols[Math.floor(Math.random() * mathSymbols.length)];
        if (typeChance < 0.8) return simpleEquations[Math.floor(Math.random() * simpleEquations.length)];
        return shapes[Math.floor(Math.random() * shapes.length)];
    }

    function createMathElement() {
        const element = {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 20 + 10, // Font size or shape size
            text: getRandomElement(),
            color: `rgba(255, 255, 255, ${Math.random() * 0.3 + 0.1})`, // Faint white
            speedX: (Math.random() - 0.5) * 1, // Horizontal speed
            speedY: (Math.random() - 0.5) * 1, // Vertical speed (can be slow scrolling)
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.005
        };
        return element;
    }

    for (let i = 0; i < numMathElements; i++) {
        mathElements.push(createMathElement());
    }

    function drawMathElement(el) {
        ctx.save();
        ctx.translate(el.x, el.y);
        ctx.rotate(el.rotation);
        ctx.fillStyle = el.color;
        ctx.font = `${el.size}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        if (shapes.includes(el.text)) {
            ctx.beginPath();
            const s = el.size;
            if (el.text === "circle") {
                ctx.arc(0, 0, s / 2, 0, Math.PI * 2);
            } else if (el.text === "square") {
                ctx.rect(-s / 2, -s / 2, s, s);
            } else if (el.text === "triangle") {
                ctx.moveTo(0, -s / 2);
                ctx.lineTo(s / 2, s / 2);
                ctx.lineTo(-s / 2, s / 2);
                ctx.closePath();
            } else if (el.text === "line") {
                ctx.moveTo(-s/2, 0);
                ctx.lineTo(s/2, 0);
                ctx.lineWidth = 2;
                ctx.strokeStyle = el.color;
                ctx.stroke();
            }
            ctx.fill();
        } else {
            ctx.fillText(el.text, 0, 0);
        }
        ctx.restore();
    }

    function updateMathElement(el) {
        el.x += el.speedX;
        el.y += el.speedY;
        el.rotation += el.rotationSpeed;

        // Boundary checks - wrap around
        if (el.x > canvas.width + el.size) el.x = -el.size;
        if (el.x < -el.size) el.x = canvas.width + el.size;
        if (el.y > canvas.height + el.size) el.y = -el.size;
        if (el.y < -el.size) el.y = canvas.height + el.size;
    }

    // --- Animation Loop ---
    function animate(timestamp) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw and update math elements
        mathElements.forEach(el => {
            updateMathElement(el);
            drawMathElement(el);
        });

        // Draw and update RoonRun character
        if (roonRunLoadedFrames === roonRunFrameCount && roonRunIdleFrames[currentRoonRunFrame].complete && roonRunIdleFrames[currentRoonRunFrame].naturalHeight !== 0) {
            if (timestamp - lastRoonRunFrameTime > roonRunAnimationSpeed) {
                currentRoonRunFrame = (currentRoonRunFrame + 1) % roonRunFrameCount;
                lastRoonRunFrameTime = timestamp;
            }
            // Update RoonRun y position based on current canvas height
            roonRunSprite.y = canvas.height - roonRunSprite.height - 20; // 20px from bottom

            ctx.drawImage(
                roonRunIdleFrames[currentRoonRunFrame],
                roonRunSprite.x,
                roonRunSprite.y,
                roonRunSprite.width,
                roonRunSprite.height
            );
            
            // Gentle horizontal movement for RoonRun
            roonRunSprite.x += roonRunSprite.dx * roonRunSprite.direction;
            if (roonRunSprite.x + roonRunSprite.width + 20 > canvas.width || roonRunSprite.x < 20) { // 20px margin
                roonRunSprite.direction *= -1; // Change direction at edges
            }
        }

        animationFrameId = requestAnimationFrame(animate);
    }
});

