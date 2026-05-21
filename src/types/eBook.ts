interface EbookPayload {
    title: string;
    author: string;
    description?: string;
    isbn?: string;
    publishedDate?: string;
}

interface Ebook extends EbookPayload {
    id: string;
    createdAt: string;
    updatedAt: string;
}
export { Ebook, EbookPayload }