import { Html5QrcodeScanner } from 'html5-qrcode';
import { useEffect } from 'react';
import toast from 'react-hot-toast';

const qrcodeRegionId = "html5qr-code-full-region";

const createConfig = (props) => {
    let config = {};
    if (props.fps) {
        config.fps = props.fps;
    }
    if (props.qrbox) {
        config.qrbox = props.qrbox;
    }
    if (props.aspectRatio) {
        config.aspectRatio = props.aspectRatio;
    }
    if (props.disableFlip !== undefined) {
        config.disableFlip = props.disableFlip;
    }
    return config;
};

const Html5QrcodePlugin = (props) => {

    useEffect(() => {
        // when component mounts
        const config = createConfig(props);
        const verbose = props.verbose === true;
        // Suceess callback is required.
        if (!(props.qrCodeSuccessCallback)) {
            toast.error("qrCodeSuccessCallback is required callback.");
        }
        const html5Scanner = new Html5QrcodeScanner(qrcodeRegionId, config, verbose);
        html5Scanner.render(props.qrCodeSuccessCallback, props.qrCodeErrorCallback);

        // cleanup function when component will unmount
        return () => {
            html5Scanner.clear().catch(error => {
                console.error("Failed to clear html5QrcodeScanner. ", error);
            });
        };
    }, [props]);

    return (
        <div id={qrcodeRegionId} />
    );
};

export default Html5QrcodePlugin;