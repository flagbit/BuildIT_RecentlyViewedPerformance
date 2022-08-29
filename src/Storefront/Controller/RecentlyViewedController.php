<?php declare(strict_types=1);

namespace BuildIT_RecentlyViewedPerformance\Storefront\Controller;

use BuildIT_RecentlyViewedPerformance\Storefront\Page\RecentlyViewedWidgetLoader;
use Shopware\Core\System\SalesChannel\SalesChannelContext;
use Shopware\Storefront\Controller\StorefrontController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

/**
 * @Route(defaults={"_routeScope"={"storefront"}})
 */
class RecentlyViewedController extends StorefrontController
{
    protected RecentlyViewedWidgetLoader $recentlyViewedWidgetLoader;

    public function __construct(
        RecentlyViewedWidgetLoader $recentlyViewedWidgetLoader
    ) {
        $this->recentlyViewedWidgetLoader = $recentlyViewedWidgetLoader;
    }

    /**
     * @Route("/widget/recentlyviewed", name="flagbit.recentlyviewed.widget", options={"seo"="false"}, methods={"POST"}, defaults={"XmlHttpRequest"=true})
     */
    public function loadWidget(Request $request, SalesChannelContext $context): Response
    {
        $page = $this->recentlyViewedWidgetLoader->load($request, $context);

        return $this->renderStorefront(
            '@FoodspringTheme/storefront/page/product-detail/cross-selling/tabs-slider.html.twig',
            ['page' => $page, 'item' => $page]
        );
    }
}
