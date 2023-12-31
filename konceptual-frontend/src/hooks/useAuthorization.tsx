import { useState,useCallback, useEffect } from 'react';
import { useRouter } from 'next/router';
import { selectAuth } from '@/store/selectors';
import { useSelector } from 'react-redux';

export default function Authorization({ children }: { children: any }) {
    const router = useRouter();
    const [authorized, setAuthorized] = useState(false);
    const user = useSelector(selectAuth);
    
    useEffect(() => {
        // on initial load - run auth check 
        authCheck(router.pathname);

        // on route change start - hide page content by setting authorized to false  
        const hideContent = () => setAuthorized(false);
        router.events.on('routeChangeStart', hideContent);

        // on route change complete - run auth check 
        router.events.on('routeChangeComplete', authCheck)

        // unsubscribe from events in useEffect return function
        return () => {
            router.events.off('routeChangeStart', hideContent);
            router.events.off('routeChangeComplete', authCheck);
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const authCheck = useCallback(
        (url: any) => {
            const publicPaths = ['/'];
            const path = url.split('?')[0];
            const token = localStorage.getItem('jwt_access_token');

            if ((!user || !token) && !publicPaths.includes(path)) {
                setAuthorized(false);
                router.push({
                    pathname: '/',
                    // query: { returnUrl: router.asPath }
                });
            } else {
                setAuthorized(true);
            }
        },
        [user],
    )

    return (authorized && children);
}