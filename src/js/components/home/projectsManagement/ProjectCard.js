import React from 'react';
import PropTypes from 'prop-types';
import { Glyphicon } from 'react-bootstrap';
import moment from 'moment';
import TranslateIcon from 'material-ui/svg-icons/action/translate';
// components
import TemplateCard from '../TemplateCard';
import Hint from '../../Hint';
import ProjectCardMenu from './ProjectCardMenu';
import TruncateAcronym from './TruncateAcronym.js';

class ProjectCard extends React.Component {
  constructor(props) {
    super(props);
    this.handleOnSelect = this.handleOnSelect.bind(this);
    this.state = { lastOpenedTimeAgo:  this.getLastOpenedTimeAgo() };
  }

  componentDidMount(){
    // add interval listener to update last opened time ago every 60 seconds
    if (this.props.projectDetails.lastOpened) {
      this.interval = setInterval(this.updateLastOpenedTimeAgo.bind(this), 60000);
    }
  }

  componentWillUnmount(){
    // remove the interval listener
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  getLastOpenedTimeAgo() {
    if (this.props.projectDetails.lastOpened) {
      return moment().to(this.props.projectDetails.lastOpened);
    } else {
      return this.props.translate('projects.never_opened');
    }
  }

  updateLastOpenedTimeAgo() {
    this.setState({ lastOpenedTimeAgo: this.getLastOpenedTimeAgo() });
  }

  /**
   * Handles the selection of this project
   */
  handleOnSelect() {
    const {
      onSelect,
      projectDetails: { projectName },
    } = this.props;
    onSelect(projectName);
    // TODO: selectProject
  }

  render() {
    const { translate, user } = this.props;
    const {
      projectName,
      projectSaveLocation,
      bookAbbr,
      bookName,
      target_language,
      isSelected,
    } = this.props.projectDetails;
    const targetLanguageBookName = target_language.book && target_language.book.name ? target_language.book.name : null;

    let cardDetails = [
      {
        glyph: 'time',
        text: this.getLastOpenedTimeAgo(),
      },
      {
        glyph: 'book',
        text: bookName && bookAbbr ?
          TruncateAcronym(bookName, bookAbbr, 23, targetLanguageBookName) :
          'No book info found',
      },
      {
        translateIcon: true,
        text: target_language.name && target_language.id
          ? TruncateAcronym(
            target_language.name, target_language.id, 23)
          : 'No language info found',
      },
    ];

    // content
    let content = (
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '-10px',
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}>
          <Hint position={'bottom'} label={projectName}>
            <strong style={{
              fontSize: 'x-large',
              overflow: 'hidden',
              maxWidth: 400,
              textOverflow: 'ellipsis',
              display: 'block',
              whiteSpace: 'nowrap',
            }}> {projectName} </strong>
          </Hint>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            width: '410px',
            marginBottom: '6px',
          }}>
            <table style={{ width: '100%' }}>
              <tbody>
                <tr>
                  {
                    cardDetails.map((cardDetail, index) => {
                      let width;

                      switch (cardDetail.glyph) {
                      case 'time':
                      case 'book':
                      default:
                        width = '30%';
                        break;
                      }
                      return (
                        <td style={{ width: width, verticalAlign: 'top' }}
                          key={index}>
                          <table style={{ width: '100%' }}>
                            <tbody>
                              <tr>
                                <td
                                  style={{ display: 'flex', alignItems: 'center' }}>
                                  {cardDetail.translateIcon ?
                                    <TranslateIcon style={{
                                      alignSelf: 'flex-start',
                                      width: 22,
                                      minWidth: 22,
                                      color: '#000000',
                                      marginRight: '5px',
                                      marginBottom: '5px',
                                    }}/>
                                    :
                                    <Glyphicon glyph={cardDetail.glyph} style={{
                                      marginRight: '5px',
                                      top: '2px',
                                    }}/>
                                  }&nbsp;{cardDetail.text}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      );
                    })
                  }
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          textAlign: 'right',
          marginRight: '-6px',
        }}>
          <ProjectCardMenu projectSaveLocation={projectSaveLocation}
            translate={translate}
            user={user}/>
          <div>
            <button className='btn-prime' disabled={isSelected}
              onClick={this.handleOnSelect}
              style={{ width: '90px', marginBottom: '0' }}>
              {translate('buttons.select_button')}
            </button>
          </div>
        </div>
      </div>
    );

    // heading
    const heading = (
      <span/>
    );

    return (
      <TemplateCard
        heading={heading}
        content={content}
      />
    );
  }
}

ProjectCard.propTypes = {
  user: PropTypes.any.isRequired,
  onSelect: PropTypes.func.isRequired,
  translate: PropTypes.func.isRequired,
  projectDetails: PropTypes.object.isRequired,
};

export default ProjectCard;
