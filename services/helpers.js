import {ElLoading} from "element-plus";

export const openLoading = async (isLoading) => {
    const loading = ElLoading.service({
        lock: true,
        text: 'Загрузка...',
        background: 'rgba(0, 0, 0, 0.7)',
    })
    if (isLoading === true) {
        loading.close();
    }
}
