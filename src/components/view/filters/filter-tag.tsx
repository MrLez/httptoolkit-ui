import * as React from 'react';
import * as polished from 'polished';

import { styled } from '../../../styles';
import { Icon } from '../../../icons';

import { Filter } from '../../../model/filters/search-filters';

const FilterTagDelete = styled(Icon).attrs(() => ({
    icon: ['fas', 'times']
}))`
    position: absolute;
    right: -20px;
    top: 50%;
    transform: translateY(-50%);
    transition: right 0.1s;
    cursor: pointer;

    padding: 6px;
    background-image: radial-gradient(
        ${p => polished.rgba(p.theme.mainBackground, 0.9)} 50%,
        transparent 100%
    );
`;

const FilterTagName = styled.span`
`

const FilterTagContainer = styled.div`
    display: flex;
    align-items: center;

    position: relative;
    overflow: hidden;

    margin-right: 5px;
    padding: 4px 4px;

    background-color: ${p => p.theme.mainBackground};
    border: 1px solid ${p => p.theme.containerWatermark};
    box-shadow: 0 2px 4px 0 rgba(0,0,0,0.2);
    border-radius: 3px;

    &:hover {
        box-shadow: 0 2px 4px 0 rgba(0,0,0,0.4);

        > ${FilterTagDelete} {
            right: 0;
        }
    }

    &:focus-within {
        outline: none;
        border-color: ${p => p.theme.popColor};
    }
`;

export const FilterTag = (props: {
    filter: Filter,
    onDelete: () => void
}) => {

    return <FilterTagContainer tabIndex={-1}>
        <FilterTagName>{ props.filter.toString() }</FilterTagName>
        <FilterTagDelete onClick={props.onDelete} />
    </FilterTagContainer>;
}