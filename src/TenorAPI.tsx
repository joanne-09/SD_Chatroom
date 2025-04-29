const TENOR_API_KEY = process.env.REACT_APP_TENOR_API_KEY;
const TENOR_API_URL = "https://tenor.googleapis.com/v2";

export interface GIF {
    id: string;
    title: string;
    preview: string;
    url: string;
}

export const searchGIF = async (query: string): Promise<GIF[]> => {
    try{
        const response = await fetch(
            `${TENOR_API_URL}/search?q=${encodeURIComponent(query)}&key=${TENOR_API_KEY}&limit=20`
        );

        const data = await response.json();

        return data.results.map((gif: any) => ({
            id: gif.id,
            title: gif.title,
            preview: gif.media_formats.tinygif.url,
            url: gif.media_formats.gif.url,
        }));
    } catch(error) {
        console.error('Error fetching GIFs:', error);
        return [];
    }
}

export const trendingGIF = async (): Promise<GIF[]> => {
    try{
        const response = await fetch(
            `${TENOR_API_URL}/featured?key=${TENOR_API_KEY}&limit=20`
        );

        const data = await response.json();

        return data.results.map((gif: any) => ({
            id: gif.id,
            title: gif.title,
            preview: gif.media_formats.tinygif.url,
            url: gif.media_formats.gif.url,
        }));
    } catch(error) {
        console.error('Error fetching trending GIFs:', error);
        return [];
    }
}