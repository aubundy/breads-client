import React, { Component } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import tags from '../tags';
import { removeModal } from './actions';
// for whatever reason, importing from the index file returns undefined. But it doesn't in ArticleForm
import { fetchReadings } from '../globalReadings/actions';
import { RootState } from '../rootReducer';

type ModalProps = PropsFromRedux & {
    title: string
}

type ModalState = {
    newTags: string
    oldTags: string
    [k: string]: string
}

class Modal extends Component<ModalProps, ModalState> {
    constructor(props: ModalProps) {
        super(props);
        this.state = {
            newTags: '',
            oldTags: ''
        }
    }

    componentDidUpdate(prevProps: ModalProps) {
        if (this.props.modals.modalProps.tag_names !== prevProps.modals.modalProps.tag_names) {
            this.setState({
                newTags: this.props.modals.modalProps.tag_names ? this.props.modals.modalProps.tag_names.join(' ') : '',
                oldTags: this.props.modals.modalProps.tag_names ? this.props.modals.modalProps.tag_names.join(' ') : ''
            });
        }
    }

    handleClose = (e: React.PointerEvent<HTMLButtonElement>): void => {
        this.props.removeModal();
    }

    handleChange = (e: React.FormEvent<HTMLInputElement>): void => {
        this.setState({
            [e.currentTarget.name]: e.currentTarget.value
        });
    };

    handleNewTags = (e: React.PointerEvent<HTMLButtonElement>): void => {
        const { add_tags, delete_tags } = this.compareTagArrays(this.state.oldTags.split(' '), this.state.newTags.split(' '));
        const tag_names = this.props.modals.modalProps.tag_names;

        if (tag_names.length === 0) this.props.postNewTags(this.props.modals.modalProps.reading.url, add_tags);
        else this.props.updateTags(this.props.modals.modalProps.reading.url, add_tags, delete_tags);
        
        this.setState({ tags: '' });
        this.props.removeModal();
        setTimeout(() => {
            this.props.fetchTags(this.props.currentUser.user.id, this.props.currentUser.user.id);
            this.props.fetchReadings(null, this.props.currentUser.user.id);
        }, 3500);
    };

    compareTagArrays = (arr1: string[], arr2: string[]) => {
        let add_tags = arr2.filter(tag => !arr1.includes(tag)).join(' ');
        let delete_tags = arr1.filter(tag => !arr2.includes(tag)).join(' ');

        return { add_tags, delete_tags }
    }

    render() {
        const { title } = this.props;
        let { newTags, oldTags } = this.state;

        return (
            <div className='modal fade' id='exampleModal' tabIndex={-1} role='dialog' aria-labelledby='exampleModalLabel' aria-hidden='true'>
                <div className='modal-dialog' role='document'>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <h5 className='modal-title' id='exampleModalLabel'>{title}</h5>
                            <button onClick={this.handleClose} type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>
                        <div className='modal-body'>
                        <input
                            type='text'
                            className='form-control form-control-sm'
                            id='tags-modal'
                            name='newTags'
                            onChange={this.handleChange}
                            value={newTags}
                        />
                        <small className='form-text text-muted'>
                            Add, update, and delete tags for this reading above. Separate tags with '#'. (e.g. #fun #learning)
                        </small>
                        </div>
                        <div className='modal-footer'>
                            <button onClick={this.handleClose} type='button' className='btn btn-secondary' data-dismiss='modal'>Close</button>
                            {oldTags === newTags 
                                ? <button onClick={this.handleNewTags} type='button' className='btn btn-outline-primary' data-dismiss='modal' disabled>Save changes</button>
                                : <button onClick={this.handleNewTags} type='button' className='btn btn-primary' data-dismiss='modal'>Save changes</button>

                            }
                            
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

function mapStateToProps(state: RootState) {
    return {
        currentUser: state.currentUser,
        loading: state.loading,
        modals: state.modals
    }
}

const connector = connect(mapStateToProps, { ...tags.actions, fetchReadings, removeModal });

type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(Modal);