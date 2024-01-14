import React, { useEffect } from "react";

const OAuthCallback: React.FC<{ apiOrigin: string }> = ({ apiOrigin }) => {
    useEffect(() => {
        const url: URL = new URL(window.location.href);
        const searchParams: URLSearchParams = url.searchParams;

        const code = searchParams.get("code");
        const scope = searchParams.get("scope");

        if (!code || !scope) {
            window.location.href = "/";
        } else {
            fetch(`${apiOrigin}/api/auth/code`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ code: code, scope: scope }),
                credentials: "include",
            })
                .then((response) => response.json())
                .then(() => {
                    window.location.href = "/";
                })
                .catch((error) => {
                    console.log(error);
                });
        }
    }, []);

    return (
        <div className="font-sf-pro flex flex-col justify-center items-center h-screen bg-[#131213] text-center text-white">
            <div className="text-lg">Redirecting...</div>
            <div className="text-lg text-gray-300">
                Click{" "}
                <a href="/" className="underline text-white">
                    here
                </a>{" "}
                if you aren't automatically redirected
            </div>
        </div>
    );
};

export default OAuthCallback;
