export default async (req) => {
    const hookUrl = process.env.NETLIFY_BUILD_HOOK_URL;
    if (!hookUrl) {
        console.error("NETLIFY_BUILD_HOOK_URL environment variable is not defined");
        return new Response("Missing hook URL", { status: 500 });
    }
    
    try {
        console.log("Triggering Netlify build hook...");
        const response = await fetch(hookUrl, { method: 'POST' });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        console.log("Build hook triggered successfully!");
        return new Response("Build triggered successfully", { status: 200 });
    } catch (error) {
        console.error("Error triggering build hook:", error.message || error);
        return new Response(`Error: ${error.message || error}`, { status: 500 });
    }
};

export const config = {
    schedule: "0 0 1,15 * *"
};
