<?php

declare(strict_types=1);

namespace BuildIT_RecentlyViewedPerformance\Service;

use Shopware\Storefront\Framework\Cookie\CookieProviderInterface;

class RecentlyViewedCookieProvider implements CookieProviderInterface
{

    private CookieProviderInterface $originalService;

    public function __construct(CookieProviderInterface $service)
    {
        $this->originalService = $service;
    }

    // cookies can also be provided as a group
    private const cookieGroup = [
        'snippet_name' => 'cookie.groupComfortFeatures',
        'entries' => [
            [
                'snippet_name' => 'cookie.recentlyViewed',
                'cookie' => 'buildit_recently_viewed_storage',
                'value' => '',
                'expiration' => '1'
            ]
        ],
    ];

    public function getCookieGroups(): array
    {
        $cookieGroups = $this->originalService->getCookieGroups();

        foreach ($cookieGroups as $index => $cookieGroup) {
            if ($cookieGroup['snippet_name'] === self::cookieGroup['snippet_name']) {

                foreach (self::cookieGroup['entries'] as $entry) {
                    $cookieGroups[$index]['entries'][] = $entry;
                }
            }
        }

        return $cookieGroups;
    }
}
