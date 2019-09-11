import React from 'react';
import PropTypes from 'prop-types';
import { Checkbox } from 'material-ui';
import { Glyphicon } from 'react-bootstrap';
import TranslateIcon from 'material-ui/svg-icons/action/translate';
import { getBookTranslationShort } from '../../../../helpers/localizationHelpers';
import { getDetailsFromProjectName } from '../../../../helpers/ProjectDetailsHelpers';

const SearchResults = ({
  repos,
  importLink,
  translate,
  handleURLInputChange,
}) => (
  <table style={{ width: '100%' }}>
    <tbody>
      {
        repos.length === 0 ?
          <tr style={{
            display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--accent-color-dark)', height: '130px',
          }}>
            <td>{translate('projects.no_search_results')}</td>
          </tr>
          :
          repos.map((project, index) => {
            const {
              bookId, bookName, languageId,
            } = getDetailsFromProjectName(project.name, translate);
            const BookNameLocalized = getBookTranslationShort(translate, bookName, bookId) || '';
            let disabledCheckBox = false;

            if (project.html_url === importLink) {
              disabledCheckBox = false;
            } else if (importLink) {
              disabledCheckBox = true;
            }
            return (
              <tr
                key={index}
                style={{ borderBottom: '1px solid var(--background-color)', padding: '10px 0px' }}
              >
                <td style={{ display: 'flex', padding: '10px 0px' }}>
                  <Checkbox
                    checked={project.html_url === importLink}
                    disabled={disabledCheckBox}
                    style={{
                      display: 'flex', width: '20px', color: '#000000', marginRight: '5px',
                    }}
                    iconStyle={{ fill: 'var(--accent-color-dark)' }}
                    onCheck={() => importLink ? handleURLInputChange('') : handleURLInputChange(project.html_url)}
                  />&nbsp;
                  <span style ={{ color: '#000000' }}>
                    {project.name}
                  </span>
                </td>
                <td>
                  <Glyphicon glyph={'user'} style={{ color: '#000000' }} />&nbsp;{project.owner.login}
                </td>
                <td>
                  <TranslateIcon style={{
                    height: '20px', width: '20px', color: '#000000',
                  }} />&nbsp;{languageId}
                </td>
                <td>
                  <Glyphicon glyph={'book'} style={{ color: '#000000' }} />
                  &nbsp;{BookNameLocalized}
                  &nbsp;({bookId})
                </td>
              </tr>
            );
          })
      }
    </tbody>
  </table>
);

SearchResults.propTypes = {
  translate: PropTypes.func.isRequired,
  repos: PropTypes.array.isRequired,
  importLink: PropTypes.string.isRequired,
  handleURLInputChange: PropTypes.func.isRequired,
};

export default SearchResults;
