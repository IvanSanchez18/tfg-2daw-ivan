import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LoadingScreen from "../../components/loadingScreen/LoadingScreen";
import "./managementLayout.scss";

export const ManagementLayout = ({
  loading,
  session,
  brandColor,
  backUrl,
  wrapperClassName = "",

  activeTab,
  setActiveTab,
  tabLabels,

  titles = { active: '', history: '' },
  descriptions = { active: '', history: '' },

  showCreator,
  setShowCreator,
  actionButtonText,
  actionButtonIcon = "fas fa-plus",

  creatorNode,
  activeListNode,
  historyListNode,
  pickerNode
}) => {
  const { t } = useTranslation('myGM/rivalries');
  const navigate = useNavigate();

  const labels = {
    active: tabLabels?.active || t('active'),
    history: tabLabels?.history || t('history')
  };

  if (loading || !session) return <LoadingScreen active={loading} />;

  return (
    <div className={wrapperClassName} style={{ '--dynamic-brand-color': brandColor }}>
      <div className="top-bar">
        <button className="back-btn" onClick={() => navigate(backUrl)}>
          <i className="fas fa-arrow-left"></i> {t('back')}
        </button>
        <div className="view-tabs">
          <button
            className={activeTab === 'active' ? 'active' : ''}
            onClick={() => setActiveTab('active')}
          >
            {labels.active}
          </button>
          <button
            className={activeTab === 'history' ? 'active' : ''}
            onClick={() => setActiveTab('history')}
          >
            {labels.history}
          </button>
        </div>
      </div>

      <div className="header-actions">
        <div>
          <h1>{activeTab === 'active' ? titles.active : titles.history}</h1>
          <p>{activeTab === 'active' ? descriptions.active : descriptions.history}</p>
        </div>
        {activeTab === 'active' && !showCreator && (
          <button className="accent-btn" onClick={() => setShowCreator(true)}>
            <i className={actionButtonIcon}></i> {actionButtonText}
          </button>
        )}
      </div>

      {showCreator && activeTab === 'active' && creatorNode}

      {activeTab === 'active' && activeListNode}
      {activeTab === 'history' && historyListNode}

      {pickerNode}
    </div>
  );
};

export default ManagementLayout;