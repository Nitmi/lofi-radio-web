import assert from 'node:assert/strict';
import test from 'node:test';

import { extractHlsUrls } from '../src/app/api/bilibili-stream/route';

test('extractHlsUrls keeps compatible HLS fallbacks in priority order', () => {
  const playInfo = {
    playurl_info: {
      playurl: {
        stream: [
          {
            protocol_name: 'http_hls',
            format: [
              {
                format_name: 'fmp4',
                codec: [
                  {
                    codec_name: 'avc',
                    current_qn: 250,
                    base_url: '/fmp4-avc.m3u8',
                    url_info: [{ host: 'https://fmp4.example.com', extra: '?token=1' }],
                  },
                ],
              },
              {
                format_name: 'ts',
                codec: [
                  {
                    codec_name: 'hevc',
                    current_qn: 250,
                    base_url: '/ts-hevc.m3u8',
                    url_info: [{ host: 'https://ts-hevc.example.com', extra: '?token=2' }],
                  },
                  {
                    codec_name: 'avc',
                    current_qn: 250,
                    base_url: '/ts-avc.m3u8',
                    url_info: [
                      { host: 'https://ts-avc-primary.example.com', extra: '?token=3' },
                      { host: 'https://ts-avc-backup.example.com', extra: '?token=4' },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    },
  };

  assert.deepEqual(extractHlsUrls(playInfo), [
    'https://ts-avc-primary.example.com/ts-avc.m3u8?token=3',
    'https://ts-avc-backup.example.com/ts-avc.m3u8?token=4',
    'https://ts-hevc.example.com/ts-hevc.m3u8?token=2',
    'https://fmp4.example.com/fmp4-avc.m3u8?token=1',
  ]);
});
