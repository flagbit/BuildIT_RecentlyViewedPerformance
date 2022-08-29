<?php

declare(strict_types=1);

namespace BuildIT_RecentlyViewedPerformance;

use Shopware\Core\Framework\Plugin;
use Shopware\Core\Framework\Plugin\Context\ActivateContext;
use Shopware\Core\Framework\Plugin\Context\DeactivateContext;
use Shopware\Core\Framework\Plugin\Context\InstallContext;
use Shopware\Core\Framework\Plugin\Context\UninstallContext;
use Shopware\Core\Framework\Plugin\Context\UpdateContext;

class BuildIT_RecentlyViewedPerformance extends Plugin
{
    public function install(InstallContext $context): void
    {
        parent::install($context);
    }

    public function postInstall(InstallContext $context): void
    {
        parent::postInstall($context);
    }

    public function update(UpdateContext $context): void
    {
        parent::update($context);
    }

    public function postUpdate(UpdateContext $context): void
    {
        parent::postUpdate($context);
    }

    public function activate(ActivateContext $context): void
    {
        parent::activate($context);
    }

    public function deactivate(DeactivateContext $context): void
    {
        parent::deactivate($context);
    }

    public function uninstall(UninstallContext $context): void
    {
        parent::uninstall($context);
        if ($context->keepUserData()) {
            return;
        }
    }
}
