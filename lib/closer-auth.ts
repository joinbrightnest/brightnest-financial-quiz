import { verify } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export function getCloserIdFromToken(request: Request): string | null {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return null;
        }

        const token = authHeader.substring(7);
        const decoded = verify(token, JWT_SECRET) as { closerId: string };
        
        return decoded.closerId;
    } catch (error) {
        console.error('Token verification failed:', error);
        return null;
    }
}
