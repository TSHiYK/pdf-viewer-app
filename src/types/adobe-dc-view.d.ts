// types/adobe-dc-view.d.ts

interface AdobeDC {
    View: {
        new(config: { clientId: string; divId: string }): AdobeDCView;
        Enum: {
            CallbackType: {
                PAGE_VIEW: string;
                ZOOM_CHANGE: string;
            };
        };
    };
}

interface AdobeDCView {
    previewFile: (config: {
        content: { location: { url: string } };
        metaData: { fileName: string };
    }, options: any) => void;
    registerCallback: (type: string, callback: (event: any) => void) => void;
    navigationManager: {
        setActiveNavigationItem: (pageNumber: number) => void;
    };
    zoom: (zoomType: string) => void;
}

interface Window {
    AdobeDC: AdobeDC;
}