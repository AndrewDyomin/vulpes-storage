import { Knowledge } from "../components/Knowledge/Knowledge";
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { useTranslation } from "react-i18next";

export default function KnowledgeBase() {
    const { t } = useTranslation();
    
    return (
        <HelmetProvider>
          <div>
            <Helmet>
              <title>{t('knowledge')}</title>
            </Helmet>
            <Knowledge />
          </div>
        </HelmetProvider>
    );
}