<?php declare(strict_types=1);

namespace BuildIT_RecentlyViewedPerformance\Storefront\Page;

use Shopware\Core\Framework\DataAbstractionLayer\Search\Criteria;
use Shopware\Core\System\SalesChannel\Entity\SalesChannelRepositoryInterface;
use Shopware\Core\System\SalesChannel\SalesChannelContext;
use Shopware\Storefront\Page\GenericPageLoaderInterface;
use Symfony\Component\HttpFoundation\Request;

class RecentlyViewedWidgetLoader
{
    private GenericPageLoaderInterface $genericPageLoader;

    private SalesChannelRepositoryInterface $productRepository;

    public function __construct(
        GenericPageLoaderInterface $genericLoader,
        SalesChannelRepositoryInterface $productRepository,
    ) {
        $this->genericPageLoader = $genericLoader;
        $this->productRepository = $productRepository;
    }

    public function load(Request $request, SalesChannelContext $salesChannelContext): RecentlyViewedWidget
    {
        $page = $this->genericPageLoader->load($request, $salesChannelContext);

        $page = RecentlyViewedWidget::createFrom($page);

        $page->setProducts([]);

        $products = $request->request->get('products');
        if (is_array($products)) {
            $criteria = new Criteria($products);
            $productsResponse = $this->productRepository->search($criteria, $salesChannelContext);
            $page->setProducts($productsResponse->getElements());
        }

        if ($page->getMetaInformation()) {
            $page->getMetaInformation()->assign(['robots' => 'noindex,follow']);
        }

        return $page;
    }
}
