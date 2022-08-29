<?php declare(strict_types=1);

namespace BuildIT_RecentlyViewedPerformance\Storefront\Page;

use Shopware\Storefront\Page\Page;

class RecentlyViewedWidget extends Page
{
    protected array $products;

    public function getProducts(): array
    {
        return $this->products;
    }

    public function setProducts(array $products): void
    {
        $this->products = $products;
    }
}
