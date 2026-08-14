import { z } from 'zod';
import { qbittorrentClient } from '../clients/qbittorrent.js';
import { radarrClient } from '../clients/radarr.js';
import { sonarrClient } from '../clients/sonarr.js';
export const listDownloadsToolDefinition = {
    name: 'list_downloads',
    description: 'List all active and pending downloads across qBittorrent, Radarr and Sonarr. Returns a consolidated view of what is currently downloading, being imported, or stuck.',
    inputSchema: {
        type: 'object',
        properties: {
            includeCompleted: {
                type: 'boolean',
                description: 'Whether to include recently completed downloads (default: false)'
            }
        }
    }
};
const listDownloadsInputSchema = z.object({
    includeCompleted: z.boolean().default(false)
});
export function formatBytes(bytes) {
    if (bytes === 0)
        return '0 B';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}
export function formatSpeed(bytesPerSecond) {
    if (bytesPerSecond === 0)
        return '0 B/s';
    return `${formatBytes(bytesPerSecond)}/s`;
}
export function formatEta(seconds) {
    if (seconds === 8640000 || seconds < 0)
        return '∞';
    if (seconds < 60)
        return `${seconds}s`;
    if (seconds < 3600)
        return `${Math.round(seconds / 60)} min`;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.round((seconds % 3600) / 60);
    return `${hours}h ${minutes}min`;
}
function formatTorrent(torrent) {
    const progress = `${(torrent.progress * 100).toFixed(1)}%`;
    const size = `${formatBytes(torrent.size * torrent.progress)} / ${formatBytes(torrent.size)}`;
    const speed = torrent.dlspeed > 0 ? ` — ${formatSpeed(torrent.dlspeed)}` : '';
    const eta = torrent.dlspeed > 0 ? ` — ETA ${formatEta(torrent.eta)}` : '';
    const category = torrent.category ? ` [${torrent.category}]` : '';
    return `  • ${torrent.name}${category} — ${progress} (${size})${speed}${eta}`;
}
export async function handleListDownloads(args) {
    const input = listDownloadsInputSchema.parse(args);
    const [torrents, radarrQueue, sonarrQueue] = await Promise.all([
        qbittorrentClient.getTorrents({
            filter: input.includeCompleted ? 'all' : 'active'
        }),
        radarrClient.getQueue().catch(() => []),
        sonarrClient.getQueue().catch(() => [])
    ]);
    if (torrents.length === 0 && radarrQueue.length === 0 && sonarrQueue.length === 0) {
        return '📭 No active downloads. Everything is quiet on the media front.';
    }
    const sections = [];
    const activeTorrents = torrents.filter((t) => t.progress < 1 || input.includeCompleted);
    const seedingTorrents = torrents.filter((t) => t.progress >= 1 && t.state.includes('UP'));
    if (activeTorrents.length > 0) {
        const radarrTorrents = activeTorrents.filter((t) => t.category === 'radarr');
        const sonarrTorrents = activeTorrents.filter((t) => t.category === 'sonarr');
        const otherTorrents = activeTorrents.filter((t) => t.category !== 'radarr' && t.category !== 'sonarr');
        if (radarrTorrents.length > 0) {
            sections.push(`🎬 Films (${radarrTorrents.length}):\n${radarrTorrents.map(formatTorrent).join('\n')}`);
        }
        if (sonarrTorrents.length > 0) {
            sections.push(`📺 Séries (${sonarrTorrents.length}):\n${sonarrTorrents.map(formatTorrent).join('\n')}`);
        }
        if (otherTorrents.length > 0) {
            sections.push(`📦 Autres (${otherTorrents.length}):\n${otherTorrents.map(formatTorrent).join('\n')}`);
        }
    }
    const importPending = [
        ...radarrQueue.filter((item) => item.status === 'completed'),
        ...sonarrQueue.filter((item) => item.status === 'completed')
    ];
    if (importPending.length > 0) {
        const lines = importPending.map((item) => `  • ${item.title ?? 'Unknown'} — awaiting import`);
        sections.push(`⏳ En attente d'import (${importPending.length}):\n${lines.join('\n')}`);
    }
    const errors = [
        ...radarrQueue.filter((item) => item.errorMessage),
        ...sonarrQueue.filter((item) => item.errorMessage)
    ];
    if (errors.length > 0) {
        const lines = errors.map((item) => `  • ${item.title ?? 'Unknown'} — ${item.errorMessage}`);
        sections.push(`⚠️ Erreurs (${errors.length}):\n${lines.join('\n')}`);
    }
    if (input.includeCompleted && seedingTorrents.length > 0) {
        sections.push(`🌱 En seeding: ${seedingTorrents.length} torrents`);
    }
    const summary = `📥 ${activeTorrents.length} downloads actifs, ${importPending.length} en import, ${errors.length} en erreur\n`;
    return summary + '\n' + sections.join('\n\n');
}
//# sourceMappingURL=list_downloads.js.map