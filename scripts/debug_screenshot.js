/* ARQUIVO: assets/modules/debug_screenshot.js */

console.log(">>> Módulo de Debug de Screenshot Carregado");

// Função para verificar se o mapa está pronto para print
function checkMapStatus() {
    const gl = map.getCanvas().getContext('webgl') || map.getCanvas().getContext('webgl2');
    const drawingBuffer = map.getCanvas().getContext('webgl').getContextAttributes().preserveDrawingBuffer;
    
    console.log("--- DIAGNÓSTICO DE IMPRESSÃO ---");
    console.log("1. Map Instance:", map ? "OK" : "FALHA");
    console.log("2. preserveDrawingBuffer:", drawingBuffer ? "ATIVADO (Correto)" : "DESATIVADO (Vai sair preto)");
    console.log("3. Tamanho da Tela:", window.innerWidth, "x", window.innerHeight);
    
    if (!drawingBuffer) {
        alert("ERRO CRÍTICO: preserveDrawingBuffer está false. O mapa sairá preto.");
    }
}

// Função Robusta de Screenshot
function forceDownload(blob, filename) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = filename;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
}

window.debugScreenshot = function(qualityScale, format) {
    const loader = document.getElementById('print-loader');
    const sidebar = document.getElementById('sidebar');
    const controls = document.querySelectorAll('.maplibregl-ctrl-group, .maplibregl-ctrl-attrib, .btn-camera, .scroll-btn, .debug-panel');

    // 1. UI Feedback
    if(loader) loader.style.display = 'block';
    if(loader) loader.innerHTML = `📸 Processando escala ${qualityScale}x (${format})...<br>Aguarde...`;
    
    // 2. Esconde UI
    sidebar.style.display = 'none';
    controls.forEach(c => c.style.display = 'none');

    // 3. Força Redesenho
    map.triggerRepaint();

    // 4. Configuração de Captura
    const options = {
        quality: 0.95,
        backgroundColor: '#ffffff', // Fundo branco forçado
        width: map.getCanvas().scrollWidth,
        height: map.getCanvas().scrollHeight,
        pixelRatio: qualityScale, // 1 = Tela, 2 = Alta, 3 = Ultra (Perigoso)
        filter: (node) => {
            // Filtra elementos que não devem aparecer
            return (node.id !== 'sidebar' && 
                    node.id !== 'print-loader' && 
                    !node.classList?.contains('btn-camera') &&
                    !node.classList?.contains('debug-panel'));
        }
    };

    setTimeout(() => {
        let promise;
        
        // Escolhe formato (JPEG é mais leve para memória)
        if (format === 'jpeg') {
            promise = htmlToImage.toJpeg(document.body, options);
        } else {
            promise = htmlToImage.toBlob(document.body, options);
        }

        promise.then(function (data) {
            // Se for JPEG retorna string base64, se Blob retorna blob
            if (format === 'jpeg') {
                const link = document.createElement('a');
                link.download = `mapa_tpc_${format}_${qualityScale}x.jpg`;
                link.href = data;
                link.click();
            } else {
                forceDownload(data, `mapa_tpc_${format}_${qualityScale}x.png`);
            }
            
            // Restaura UI
            if(loader) loader.style.display = 'none';
            sidebar.style.display = 'flex';
            controls.forEach(c => c.style.display = 'block');

        }).catch(function (error) {
            console.error('ERRO AO GERAR:', error);
            alert(`Erro na escala ${qualityScale}x. O navegador ficou sem memória.\nTente uma escala menor ou formato JPEG.`);
            
            if(loader) loader.style.display = 'none';
            sidebar.style.display = 'flex';
            controls.forEach(c => c.style.display = 'block');
        });
    }, 1000); // Delay maior para garantir renderização
};

// Cria Painel de Debug na Tela
document.addEventListener("DOMContentLoaded", () => {
    const div = document.createElement('div');
    div.className = 'debug-panel';
    div.style.cssText = "position:absolute; top:10px; left:10px; background:white; padding:10px; z-index:9999; border:2px solid red; font-family:sans-serif; font-size:11px;";
    div.innerHTML = `
        <strong>DEBUG IMPRESSÃO</strong><br>
        <button onclick="checkMapStatus()" style="margin:5px 0; display:block;">1. Check Status</button>
        <hr>
        <strong>PNG (Transparente)</strong><br>
        <button onclick="debugScreenshot(1, 'png')">1x (Tela)</button>
        <button onclick="debugScreenshot(1.5, 'png')">1.5x (Médio)</button>
        <button onclick="debugScreenshot(2, 'png')">2x (Alto)</button>
        <hr>
        <strong>JPEG (Leve/A3)</strong><br>
        <button onclick="debugScreenshot(2, 'jpeg')">2x (Bom)</button>
        <button onclick="debugScreenshot(3, 'jpeg')">3x (Máximo)</button>
    `;
    document.body.appendChild(div);
});